;; Asset Tokenizer - Tokenize real-world assets
;; Built for Stacks mainnet deployment by Marcus David

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u100))
(define-constant err-invalid-input (err u101))
(define-constant err-not-found (err u102))
(define-constant err-insufficient-balance (err u103))
(define-constant err-asset-locked (err u104))
(define-constant err-not-verified (err u105))
(define-constant err-transfer-failed (err u106))

;; Asset status constants
(define-constant status-pending u0)
(define-constant status-verified u1)
(define-constant status-active u2)
(define-constant status-locked u3)

;; Data Variables
(define-data-var total-assets uint u0)
(define-data-var total-tokens-issued uint u0)
(define-data-var platform-fee uint u250) ;; 2.5%

;; Data Maps
(define-map tokenized-assets
  uint
  {
    owner: principal,
    asset-type: (string-ascii 32),
    description: (string-ascii 256),
    total-value: uint,
    token-supply: uint,
    price-per-token: uint,
    verification-doc: (string-ascii 256),
    verifier: principal,
    status: uint,
    creation-date: uint,
    metadata-uri: (string-ascii 256),
    location: (string-ascii 128)
  }
)

(define-map token-balances
  { asset-id: uint, holder: principal }
  uint
)

(define-map asset-holders uint (list 500 principal))
(define-map user-assets principal (list 100 uint))

(define-map asset-transactions
  uint
  {
    asset-id: uint,
    from: principal,
    to: principal,
    amount: uint,
    price-per-token: uint,
    timestamp: uint,
    transaction-type: (string-ascii 16) ;; "mint", "transfer", "burn"
  }
)

(define-data-var transaction-counter uint u0)

(define-map verified-appraisers principal bool)
(define-map asset-valuations
  { asset-id: uint, appraiser: principal }
  {
    valuation: uint,
    timestamp: uint,
    report-uri: (string-ascii 256)
  }
)

;; Read-only functions
(define-read-only (get-asset (asset-id uint))
  (map-get? tokenized-assets asset-id)
)

(define-read-only (get-token-balance (asset-id uint) (holder principal))
  (default-to u0 (map-get? token-balances { asset-id: asset-id, holder: holder }))
)

(define-read-only (get-asset-holders (asset-id uint))
  (default-to (list) (map-get? asset-holders asset-id))
)

(define-read-only (get-user-assets (user principal))
  (default-to (list) (map-get? user-assets user))
)

(define-read-only (is-verified-appraiser (appraiser principal))
  (default-to false (map-get? verified-appraisers appraiser))
)

(define-read-only (get-asset-valuation (asset-id uint) (appraiser principal))
  (map-get? asset-valuations { asset-id: asset-id, appraiser: appraiser })
)

(define-read-only (calculate-token-value (asset-id uint) (token-amount uint))
  (match (map-get? tokenized-assets asset-id)
    asset-data
      (ok (* token-amount (get price-per-token asset-data)))
    err-not-found
  )
)

;; Public functions

;; Tokenize real-world asset
(define-public (tokenize-asset 
  (asset-type (string-ascii 32))
  (description (string-ascii 256))
  (total-value uint)
  (token-supply uint)
  (verification-doc (string-ascii 256))
  (metadata-uri (string-ascii 256))
  (location (string-ascii 128))
)
  (let 
    (
      (asset-id (var-get total-assets))
      (price-per-token (/ total-value token-supply))
      (user-assets-list (default-to (list) (map-get? user-assets tx-sender)))
    )
    (asserts! (> total-value u0) err-invalid-input)
    (asserts! (> token-supply u0) err-invalid-input)
    
    ;; Store asset
    (map-set tokenized-assets asset-id {
      owner: tx-sender,
      asset-type: asset-type,
      description: description,
      total-value: total-value,
      token-supply: token-supply,
      price-per-token: price-per-token,
      verification-doc: verification-doc,
      verifier: tx-sender, ;; Will be updated by verifier
      status: status-pending,
      creation-date: stacks-block-height,
      metadata-uri: metadata-uri,
      location: location
    })
    
    ;; Initial token allocation to owner
    (map-set token-balances { asset-id: asset-id, holder: tx-sender } token-supply)
    (map-set asset-holders asset-id (list tx-sender))
    (map-set user-assets tx-sender 
      (unwrap-panic (as-max-len? (append user-assets-list asset-id) u100)))
    
    ;; Record minting transaction
    (try! (record-transaction asset-id tx-sender tx-sender token-supply price-per-token "mint"))
    
    (var-set total-assets (+ asset-id u1))
    (var-set total-tokens-issued (+ (var-get total-tokens-issued) token-supply))
    (ok asset-id)
  )
)

;; Verify asset (appraiser only)
(define-public (verify-asset (asset-id uint) (verified-value uint))
  (match (map-get? tokenized-assets asset-id)
    asset-data
      (begin
        (asserts! (is-verified-appraiser tx-sender) err-unauthorized)
        (asserts! (is-eq (get status asset-data) status-pending) err-invalid-input)
        
        ;; Update asset status and verifier
        (map-set tokenized-assets asset-id 
          (merge asset-data { 
            status: status-verified,
            verifier: tx-sender,
            total-value: verified-value,
            price-per-token: (/ verified-value (get token-supply asset-data))
          }))
        
        ;; Record valuation
        (map-set asset-valuations { asset-id: asset-id, appraiser: tx-sender } {
          valuation: verified-value,
          timestamp: stacks-block-height,
          report-uri: ""
        })
        
        (ok true)
      )
    err-not-found
  )
)

;; Activate asset for trading
(define-public (activate-asset (asset-id uint))
  (match (map-get? tokenized-assets asset-id)
    asset-data
      (begin
        (asserts! (is-eq tx-sender (get owner asset-data)) err-unauthorized)
        (asserts! (is-eq (get status asset-data) status-verified) err-not-verified)
        
        (map-set tokenized-assets asset-id 
          (merge asset-data { status: status-active }))
        (ok true)
      )
    err-not-found
  )
)

;; Transfer tokens
(define-public (transfer-tokens (asset-id uint) (recipient principal) (amount uint) (price-per-token uint))
  (match (map-get? tokenized-assets asset-id)
    asset-data
      (let 
        (
          (sender-balance (get-token-balance asset-id tx-sender))
          (recipient-balance (get-token-balance asset-id recipient))
          (total-price (* amount price-per-token))
          (platform-fee-amount (/ (* total-price (var-get platform-fee)) u10000))
          (seller-amount (- total-price platform-fee-amount))
          (holders (default-to (list) (map-get? asset-holders asset-id)))
        )
        (asserts! (is-eq (get status asset-data) status-active) err-asset-locked)
        (asserts! (>= sender-balance amount) err-insufficient-balance)
        (asserts! (> amount u0) err-invalid-input)
        
        ;; Process payment
        (try! (stx-transfer-memo? total-price recipient tx-sender 0x746f6b656e2d7075726368617365))
        (try! (stx-transfer-memo? platform-fee-amount recipient contract-owner 0x706c6174666f726d2d666565))
        
        ;; Update balances
        (map-set token-balances { asset-id: asset-id, holder: tx-sender } 
          (- sender-balance amount))
        (map-set token-balances { asset-id: asset-id, holder: recipient } 
          (+ recipient-balance amount))
        
        ;; Add recipient to holders if not already there
        (if (is-none (index-of holders recipient))
          (map-set asset-holders asset-id 
            (unwrap-panic (as-max-len? (append holders recipient) u500)))
          true
        )
        
        ;; Record transaction
        (try! (record-transaction asset-id tx-sender recipient amount price-per-token "transfer"))
        
        (ok true)
      )
    err-not-found
  )
)

;; Burn tokens (reduce supply)
(define-public (burn-tokens (asset-id uint) (amount uint))
  (match (map-get? tokenized-assets asset-id)
    asset-data
      (let 
        (
          (holder-balance (get-token-balance asset-id tx-sender))
        )
        (asserts! (is-eq tx-sender (get owner asset-data)) err-unauthorized)
        (asserts! (>= holder-balance amount) err-insufficient-balance)
        (asserts! (> amount u0) err-invalid-input)
        
        ;; Update balance and supply
        (map-set token-balances { asset-id: asset-id, holder: tx-sender } 
          (- holder-balance amount))
        (map-set tokenized-assets asset-id 
          (merge asset-data { token-supply: (- (get token-supply asset-data) amount) }))
        
        ;; Record burn transaction
        (try! (record-transaction asset-id tx-sender tx-sender amount (get price-per-token asset-data) "burn"))
        
        (var-set total-tokens-issued (- (var-get total-tokens-issued) amount))
        (ok true)
      )
    err-not-found
  )
)

;; Record transaction (internal)
(define-private (record-transaction 
  (asset-id uint) 
  (from principal) 
  (to principal) 
  (amount uint) 
  (price uint) 
  (tx-type (string-ascii 16))
)
  (let 
    (
      (tx-id (var-get transaction-counter))
    )
    (map-set asset-transactions tx-id {
      asset-id: asset-id,
      from: from,
      to: to,
      amount: amount,
      price-per-token: price,
      timestamp: stacks-block-height,
      transaction-type: tx-type
    })
    (var-set transaction-counter (+ tx-id u1))
    (ok tx-id)
  )
)

;; Admin functions

;; Add verified appraiser
(define-public (add-appraiser (appraiser principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set verified-appraisers appraiser true)
    (ok true)
  )
)

;; Remove verified appraiser
(define-public (remove-appraiser (appraiser principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set verified-appraisers appraiser false)
    (ok true)
  )
)

;; Lock asset (emergency)
(define-public (lock-asset (asset-id uint))
  (match (map-get? tokenized-assets asset-id)
    asset-data
      (begin
        (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
        
        (map-set tokenized-assets asset-id 
          (merge asset-data { status: status-locked }))
        (ok true)
      )
    err-not-found
  )
)

;; Update platform fee
(define-public (set-platform-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (asserts! (<= new-fee u1000) err-invalid-input) ;; Max 10%
    (var-set platform-fee new-fee)
    (ok new-fee)
  )
)

;; Withdraw platform fees
(define-public (withdraw-fees (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (try! (as-contract (stx-transfer-memo? amount tx-sender contract-owner 0x706c6174666f726d2d66656573)))
    (ok amount)
  )
)
