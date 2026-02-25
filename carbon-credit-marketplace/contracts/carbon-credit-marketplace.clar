;; Carbon Credit Marketplace - Trade verified carbon credits
;; Built for Stacks mainnet deployment by Marcus David

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u100))
(define-constant err-invalid-input (err u101))
(define-constant err-not-found (err u102))
(define-constant err-insufficient-balance (err u103))
(define-constant err-invalid-price (err u104))
(define-constant err-credit-expired (err u105))

;; Data Variables
(define-data-var total-credits uint u0)
(define-data-var total-trades uint u0)
(define-data-var marketplace-fee uint u250) ;; 2.5%

;; Data Maps
(define-map carbon-credits
  uint
  {
    issuer: principal,
    project-id: (string-ascii 64),
    co2-tons: uint,
    verification-standard: (string-ascii 32),
    issue-date: uint,
    expiry-date: uint,
    price-per-ton: uint,
    available: bool,
    metadata-uri: (string-ascii 256)
  }
)

(define-map credit-ownership uint principal)
(define-map user-credits principal (list 100 uint))
(define-map verified-issuers principal bool)

(define-map trade-history
  uint
  {
    credit-id: uint,
    seller: principal,
    buyer: principal,
    price: uint,
    timestamp: uint,
    co2-tons: uint
  }
)

;; Read-only functions
(define-read-only (get-credit (credit-id uint))
  (map-get? carbon-credits credit-id)
)

(define-read-only (get-credit-owner (credit-id uint))
  (map-get? credit-ownership credit-id)
)

(define-read-only (get-user-credits (user principal))
  (default-to (list) (map-get? user-credits user))
)

(define-read-only (is-verified-issuer (issuer principal))
  (default-to false (map-get? verified-issuers issuer))
)

(define-read-only (get-marketplace-stats)
  (ok {
    total-credits: (var-get total-credits),
    total-trades: (var-get total-trades),
    marketplace-fee: (var-get marketplace-fee)
  })
)

(define-read-only (calculate-trade-fee (price uint))
  (/ (* price (var-get marketplace-fee)) u10000)
)

;; Public functions

;; Issue new carbon credit (only verified issuers)
(define-public (issue-credit 
  (project-id (string-ascii 64))
  (co2-tons uint)
  (verification-standard (string-ascii 32))
  (expiry-date uint)
  (price-per-ton uint)
  (metadata-uri (string-ascii 256))
)
  (let 
    (
      (credit-id (var-get total-credits))
      (user-credits-list (default-to (list) (map-get? user-credits tx-sender)))
    )
    (asserts! (is-verified-issuer tx-sender) err-unauthorized)
    (asserts! (> co2-tons u0) err-invalid-input)
    (asserts! (> price-per-ton u0) err-invalid-price)
    (asserts! (> expiry-date stacks-block-height) err-invalid-input)
    
    ;; Store credit
    (map-set carbon-credits credit-id {
      issuer: tx-sender,
      project-id: project-id,
      co2-tons: co2-tons,
      verification-standard: verification-standard,
      issue-date: stacks-block-height,
      expiry-date: expiry-date,
      price-per-ton: price-per-ton,
      available: true,
      metadata-uri: metadata-uri
    })
    
    (map-set credit-ownership credit-id tx-sender)
    (map-set user-credits tx-sender 
      (unwrap-panic (as-max-len? (append user-credits-list credit-id) u100))
    )
    
    (var-set total-credits (+ credit-id u1))
    (ok credit-id)
  )
)

;; Purchase carbon credit
(define-public (purchase-credit (credit-id uint))
  (match (map-get? carbon-credits credit-id)
    credit-data
      (let 
        (
          (current-owner (unwrap! (map-get? credit-ownership credit-id) err-not-found))
          (total-price (* (get co2-tons credit-data) (get price-per-ton credit-data)))
          (marketplace-fee-amount (calculate-trade-fee total-price))
          (seller-amount (- total-price marketplace-fee-amount))
          (buyer-credits (default-to (list) (map-get? user-credits tx-sender)))
          (trade-id (var-get total-trades))
        )
        (asserts! (get available credit-data) err-not-found)
        (asserts! (< stacks-block-height (get expiry-date credit-data)) err-credit-expired)
        (asserts! (not (is-eq tx-sender current-owner)) err-invalid-input)
        
        ;; Transfer payment
        (try! (stx-transfer-memo? total-price tx-sender current-owner 0x636172626f6e2d6372656469742d73616c65))
        (try! (stx-transfer-memo? marketplace-fee-amount tx-sender contract-owner 0x6d61726b6574706c6163652d666565))
        
        ;; Update ownership
        (map-set credit-ownership credit-id tx-sender)
        (map-set user-credits tx-sender 
          (unwrap-panic (as-max-len? (append buyer-credits credit-id) u100))
        )
        
        ;; Mark as sold
        (map-set carbon-credits credit-id (merge credit-data { available: false }))
        
        ;; Record trade
        (map-set trade-history trade-id {
          credit-id: credit-id,
          seller: current-owner,
          buyer: tx-sender,
          price: total-price,
          timestamp: stacks-block-height,
          co2-tons: (get co2-tons credit-data)
        })
        
        (var-set total-trades (+ trade-id u1))
        (ok credit-id)
      )
    err-not-found
  )
)

;; Retire carbon credit (remove from circulation)
(define-public (retire-credit (credit-id uint))
  (match (map-get? carbon-credits credit-id)
    credit-data
      (let 
        (
          (current-owner (unwrap! (map-get? credit-ownership credit-id) err-not-found))
        )
        (asserts! (is-eq tx-sender current-owner) err-unauthorized)
        
        ;; Mark as retired (unavailable)
        (map-set carbon-credits credit-id (merge credit-data { available: false }))
        (ok true)
      )
    err-not-found
  )
)

;; Admin functions

;; Add verified issuer
(define-public (add-verified-issuer (issuer principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set verified-issuers issuer true)
    (ok true)
  )
)

;; Remove verified issuer
(define-public (remove-verified-issuer (issuer principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set verified-issuers issuer false)
    (ok true)
  )
)

;; Update marketplace fee
(define-public (set-marketplace-fee (new-fee uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (asserts! (<= new-fee u1000) err-invalid-input) ;; Max 10%
    (var-set marketplace-fee new-fee)
    (ok new-fee)
  )
)

;; Withdraw marketplace fees
(define-public (withdraw-fees (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (try! (as-contract (stx-transfer-memo? amount tx-sender contract-owner 0x666565732d776974686472617761)))
    (ok amount)
  )
)
