;; Prediction Market - Decentralized betting on future events
;; Built for Stacks mainnet deployment by Marcus David

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u100))
(define-constant err-invalid-input (err u101))
(define-constant err-not-found (err u102))
(define-constant err-market-closed (err u103))
(define-constant err-market-resolved (err u104))
(define-constant err-insufficient-balance (err u105))
(define-constant err-already-resolved (err u106))

;; Market status constants
(define-constant market-open u0)
(define-constant market-closed u1)
(define-constant market-resolved u2)

;; Data Variables
(define-data-var total-markets uint u0)
(define-data-var platform-fee uint u300) ;; 3%
(define-data-var min-bet-amount uint u1000000) ;; 1 STX

;; Data Maps
(define-map prediction-markets
  uint
  {
    creator: principal,
    title: (string-ascii 128),
    description: (string-ascii 512),
    end-time: uint,
    resolution-time: uint,
    status: uint,
    outcome: (optional bool),
    total-yes-bets: uint,
    total-no-bets: uint,
    oracle: principal,
    category: (string-ascii 32)
  }
)

(define-map user-bets
  { market-id: uint, user: principal }
  {
    yes-amount: uint,
    no-amount: uint,
    claimed: bool
  }
)

(define-map market-participants uint (list 200 principal))
(define-map user-markets principal (list 50 uint))

;; Read-only functions
(define-read-only (get-market (market-id uint))
  (map-get? prediction-markets market-id)
)

(define-read-only (get-user-bet (market-id uint) (user principal))
  (map-get? user-bets { market-id: market-id, user: user })
)

(define-read-only (get-market-participants (market-id uint))
  (default-to (list) (map-get? market-participants market-id))
)

(define-read-only (get-user-markets (user principal))
  (default-to (list) (map-get? user-markets user))
)

(define-read-only (calculate-payout (market-id uint) (user principal))
  (match (map-get? prediction-markets market-id)
    market-data
      (match (map-get? user-bets { market-id: market-id, user: user })
        bet-data
          (match (get outcome market-data)
            outcome-value
              (let 
                (
                  (total-pool (+ (get total-yes-bets market-data) (get total-no-bets market-data)))
                  (winning-pool (if outcome-value (get total-yes-bets market-data) (get total-no-bets market-data)))
                  (user-winning-bet (if outcome-value (get yes-amount bet-data) (get no-amount bet-data)))
                  (platform-fee-amount (/ (* total-pool (var-get platform-fee)) u10000))
                  (net-pool (- total-pool platform-fee-amount))
                )
                (if (> winning-pool u0)
                  (ok (/ (* user-winning-bet net-pool) winning-pool))
                  (ok u0)
                )
              )
            (ok u0)
          )
        (ok u0)
      )
    (ok u0)
  )
)

(define-read-only (get-market-odds (market-id uint))
  (match (map-get? prediction-markets market-id)
    market-data
      (let 
        (
          (yes-bets (get total-yes-bets market-data))
          (no-bets (get total-no-bets market-data))
          (total-bets (+ yes-bets no-bets))
        )
        (if (> total-bets u0)
          (ok {
            yes-odds: (/ (* no-bets u10000) total-bets),
            no-odds: (/ (* yes-bets u10000) total-bets),
            total-pool: total-bets
          })
          (ok { yes-odds: u5000, no-odds: u5000, total-pool: u0 })
        )
      )
    err-not-found
  )
)

;; Public functions

;; Create new prediction market
(define-public (create-market 
  (title (string-ascii 128))
  (description (string-ascii 512))
  (end-time uint)
  (resolution-time uint)
  (oracle principal)
  (category (string-ascii 32))
)
  (let 
    (
      (market-id (var-get total-markets))
      (user-markets-list (default-to (list) (map-get? user-markets tx-sender)))
    )
    (asserts! (> end-time stacks-block-height) err-invalid-input)
    (asserts! (> resolution-time end-time) err-invalid-input)
    
    ;; Store market
    (map-set prediction-markets market-id {
      creator: tx-sender,
      title: title,
      description: description,
      end-time: end-time,
      resolution-time: resolution-time,
      status: market-open,
      outcome: none,
      total-yes-bets: u0,
      total-no-bets: u0,
      oracle: oracle,
      category: category
    })
    
    (map-set user-markets tx-sender 
      (unwrap-panic (as-max-len? (append user-markets-list market-id) u50))
    )
    
    (var-set total-markets (+ market-id u1))
    (ok market-id)
  )
)

;; Place bet on market outcome
(define-public (place-bet (market-id uint) (bet-on-yes bool) (amount uint))
  (match (map-get? prediction-markets market-id)
    market-data
      (let 
        (
          (current-bet (default-to { yes-amount: u0, no-amount: u0, claimed: false } 
                                  (map-get? user-bets { market-id: market-id, user: tx-sender })))
          (participants (default-to (list) (map-get? market-participants market-id)))
        )
        (asserts! (is-eq (get status market-data) market-open) err-market-closed)
        (asserts! (< stacks-block-height (get end-time market-data)) err-market-closed)
        (asserts! (>= amount (var-get min-bet-amount)) err-invalid-input)
        
        ;; Transfer bet amount to contract
        (try! (stx-transfer-memo? amount tx-sender (as-contract tx-sender) 0x70726564696374696f6e2d626574))
        
        ;; Update user bet
        (if bet-on-yes
          (map-set user-bets { market-id: market-id, user: tx-sender }
            (merge current-bet { yes-amount: (+ (get yes-amount current-bet) amount) }))
          (map-set user-bets { market-id: market-id, user: tx-sender }
            (merge current-bet { no-amount: (+ (get no-amount current-bet) amount) }))
        )
        
        ;; Update market totals
        (if bet-on-yes
          (map-set prediction-markets market-id 
            (merge market-data { total-yes-bets: (+ (get total-yes-bets market-data) amount) }))
          (map-set prediction-markets market-id 
            (merge market-data { total-no-bets: (+ (get total-no-bets market-data) amount) }))
        )
        
        ;; Add user to participants if not already there
        (if (is-none (index-of participants tx-sender))
          (map-set market-participants market-id 
            (unwrap-panic (as-max-len? (append participants tx-sender) u200)))
          true
        )
        
        (ok true)
      )
    err-not-found
  )
)

;; Resolve market (oracle only)
(define-public (resolve-market (market-id uint) (outcome bool))
  (match (map-get? prediction-markets market-id)
    market-data
      (begin
        (asserts! (is-eq tx-sender (get oracle market-data)) err-unauthorized)
        (asserts! (> stacks-block-height (get resolution-time market-data)) err-invalid-input)
        (asserts! (is-eq (get status market-data) market-open) err-already-resolved)
        
        ;; Update market with outcome
        (map-set prediction-markets market-id 
          (merge market-data { 
            status: market-resolved,
            outcome: (some outcome)
          }))
        
        (ok true)
      )
    err-not-found
  )
)

;; Claim winnings
(define-public (claim-winnings (market-id uint))
  (match (map-get? prediction-markets market-id)
    market-data
      (match (map-get? user-bets { market-id: market-id, user: tx-sender })
        bet-data
          (begin
            (asserts! (is-eq (get status market-data) market-resolved) err-market-closed)
            (asserts! (not (get claimed bet-data)) err-invalid-input)
            
            (let 
              (
                (payout (unwrap-panic (calculate-payout market-id tx-sender)))
              )
              (if (> payout u0)
                (begin
                  (try! (as-contract (stx-transfer-memo? payout tx-sender tx-sender 0x77696e6e696e67732d636c61696d)))
                  (map-set user-bets { market-id: market-id, user: tx-sender }
                    (merge bet-data { claimed: true }))
                  (ok payout)
                )
                (ok u0)
              )
            )
          )
        err-not-found
      )
    err-not-found
  )
)

;; Admin functions

;; Close market early (creator only)
(define-public (close-market (market-id uint))
  (match (map-get? prediction-markets market-id)
    market-data
      (begin
        (asserts! (is-eq tx-sender (get creator market-data)) err-unauthorized)
        (asserts! (is-eq (get status market-data) market-open) err-market-closed)
        
        (map-set prediction-markets market-id 
          (merge market-data { status: market-closed }))
        (ok true)
      )
    err-not-found
  )
)

;; Update platform fee (owner only)
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
