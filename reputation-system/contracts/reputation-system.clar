;; Reputation System - On-chain reputation scoring
;; Built for Stacks mainnet deployment by Marcus David

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u100))
(define-constant err-invalid-input (err u101))
(define-constant err-not-found (err u102))
(define-constant err-already-rated (err u103))
(define-constant err-self-rating (err u104))
(define-constant err-insufficient-stake (err u105))

;; Reputation categories
(define-constant category-general u0)
(define-constant category-trading u1)
(define-constant category-development u2)
(define-constant category-service u3)

;; Data Variables
(define-data-var total-ratings uint u0)
(define-data-var min-stake-amount uint u5000000) ;; 5 STX
(define-data-var reputation-decay-rate uint u100) ;; 1% per 1000 blocks

;; Data Maps
(define-map user-reputation
  { user: principal, category: uint }
  {
    total-score: uint,
    rating-count: uint,
    weighted-score: uint,
    last-update: uint,
    stake-amount: uint
  }
)

(define-map ratings
  uint
  {
    rater: principal,
    ratee: principal,
    category: uint,
    score: uint, ;; 1-100
    comment: (string-ascii 256),
    timestamp: uint,
    stake: uint,
    verified: bool
  }
)

(define-map user-ratings
  { rater: principal, ratee: principal, category: uint }
  uint ;; rating-id
)

(define-map user-given-ratings principal (list 100 uint))
(define-map user-received-ratings principal (list 200 uint))

(define-map reputation-validators principal bool)
(define-map category-weights uint uint) ;; category -> weight multiplier

;; Read-only functions
(define-read-only (get-reputation (user principal) (category uint))
  (map-get? user-reputation { user: user, category: category })
)

(define-read-only (get-rating (rating-id uint))
  (map-get? ratings rating-id)
)

(define-read-only (get-user-given-ratings (user principal))
  (default-to (list) (map-get? user-given-ratings user))
)

(define-read-only (get-user-received-ratings (user principal))
  (default-to (list) (map-get? user-received-ratings user))
)

(define-read-only (calculate-reputation-score (user principal) (category uint))
  (match (map-get? user-reputation { user: user, category: category })
    reputation-data
      (let 
        (
          (blocks-since-update (- stacks-block-height (get last-update reputation-data)))
          (decay-factor (/ (* blocks-since-update (var-get reputation-decay-rate)) u100000))
          (current-score (get weighted-score reputation-data))
          (decayed-score (if (> decay-factor current-score) u0 (- current-score decay-factor)))
        )
        (ok decayed-score)
      )
    (ok u0)
  )
)

(define-read-only (get-overall-reputation (user principal))
  (let 
    (
      (general-rep (unwrap-panic (calculate-reputation-score user category-general)))
      (trading-rep (unwrap-panic (calculate-reputation-score user category-trading)))
      (dev-rep (unwrap-panic (calculate-reputation-score user category-development)))
      (service-rep (unwrap-panic (calculate-reputation-score user category-service)))
      (total-categories u4)
    )
    (ok (/ (+ general-rep trading-rep dev-rep service-rep) total-categories))
  )
)

(define-read-only (is-reputation-validator (validator principal))
  (default-to false (map-get? reputation-validators validator))
)

;; Public functions

;; Stake reputation tokens
(define-public (stake-reputation (category uint) (amount uint))
  (let 
    (
      (current-rep (default-to 
        { total-score: u0, rating-count: u0, weighted-score: u0, last-update: stacks-block-height, stake-amount: u0 }
        (map-get? user-reputation { user: tx-sender, category: category })))
    )
    (asserts! (>= amount (var-get min-stake-amount)) err-insufficient-stake)
    (asserts! (<= category category-service) err-invalid-input)
    
    ;; Transfer stake to contract
    (try! (stx-transfer-memo? amount tx-sender (as-contract tx-sender) 0x7265707574617469666f6e2d7374616b65))
    
    ;; Update reputation with stake
    (map-set user-reputation { user: tx-sender, category: category }
      (merge current-rep { 
        stake-amount: (+ (get stake-amount current-rep) amount),
        last-update: stacks-block-height
      }))
    
    (ok true)
  )
)

;; Submit rating
(define-public (submit-rating 
  (ratee principal) 
  (category uint) 
  (score uint) 
  (comment (string-ascii 256))
  (stake uint)
)
  (let 
    (
      (rating-id (var-get total-ratings))
      (rater-given (default-to (list) (map-get? user-given-ratings tx-sender)))
      (ratee-received (default-to (list) (map-get? user-received-ratings ratee)))
      (existing-rating (map-get? user-ratings { rater: tx-sender, ratee: ratee, category: category }))
    )
    (asserts! (not (is-eq tx-sender ratee)) err-self-rating)
    (asserts! (is-none existing-rating) err-already-rated)
    (asserts! (<= category category-service) err-invalid-input)
    (asserts! (and (>= score u1) (<= score u100)) err-invalid-input)
    (asserts! (>= stake (var-get min-stake-amount)) err-insufficient-stake)
    
    ;; Transfer stake
    (try! (stx-transfer-memo? stake tx-sender (as-contract tx-sender) 0x726174696e672d7374616b65))
    
    ;; Store rating
    (map-set ratings rating-id {
      rater: tx-sender,
      ratee: ratee,
      category: category,
      score: score,
      comment: comment,
      timestamp: stacks-block-height,
      stake: stake,
      verified: false
    })
    
    ;; Update mappings
    (map-set user-ratings { rater: tx-sender, ratee: ratee, category: category } rating-id)
    (map-set user-given-ratings tx-sender 
      (unwrap-panic (as-max-len? (append rater-given rating-id) u100)))
    (map-set user-received-ratings ratee 
      (unwrap-panic (as-max-len? (append ratee-received rating-id) u200)))
    
    ;; Update ratee's reputation
    (try! (update-user-reputation ratee category score stake))
    
    (var-set total-ratings (+ rating-id u1))
    (ok rating-id)
  )
)

;; Update user reputation (internal)
(define-private (update-user-reputation (user principal) (category uint) (new-score uint) (stake uint))
  (let 
    (
      (current-rep (default-to 
        { total-score: u0, rating-count: u0, weighted-score: u0, last-update: stacks-block-height, stake-amount: u0 }
        (map-get? user-reputation { user: user, category: category })))
      (new-total-score (+ (get total-score current-rep) new-score))
      (new-rating-count (+ (get rating-count current-rep) u1))
      (weighted-contribution (* new-score (/ stake u1000000))) ;; Weight by stake in STX
      (new-weighted-score (+ (get weighted-score current-rep) weighted-contribution))
    )
    (map-set user-reputation { user: user, category: category } {
      total-score: new-total-score,
      rating-count: new-rating-count,
      weighted-score: new-weighted-score,
      last-update: stacks-block-height,
      stake-amount: (get stake-amount current-rep)
    })
    (ok true)
  )
)

;; Verify rating (validator only)
(define-public (verify-rating (rating-id uint))
  (match (map-get? ratings rating-id)
    rating-data
      (begin
        (asserts! (is-reputation-validator tx-sender) err-unauthorized)
        (asserts! (not (get verified rating-data)) err-invalid-input)
        
        (map-set ratings rating-id (merge rating-data { verified: true }))
        (ok true)
      )
    err-not-found
  )
)

;; Challenge rating
(define-public (challenge-rating (rating-id uint) (challenge-stake uint))
  (match (map-get? ratings rating-id)
    rating-data
      (begin
        (asserts! (>= challenge-stake (* (get stake rating-data) u2)) err-insufficient-stake)
        (asserts! (not (is-eq tx-sender (get rater rating-data))) err-invalid-input)
        
        ;; Transfer challenge stake
        (try! (stx-transfer-memo? challenge-stake tx-sender (as-contract tx-sender) 0x6368616c6c656e67652d7374616b65))
        
        ;; Mark for review (simplified - in full implementation would trigger dispute resolution)
        (map-set ratings rating-id (merge rating-data { verified: false }))
        (ok true)
      )
    err-not-found
  )
)

;; Withdraw reputation stake
(define-public (withdraw-stake (category uint) (amount uint))
  (match (map-get? user-reputation { user: tx-sender, category: category })
    reputation-data
      (begin
        (asserts! (>= (get stake-amount reputation-data) amount) err-insufficient-stake)
        
        ;; Transfer stake back
        (try! (as-contract (stx-transfer-memo? amount tx-sender tx-sender 0x7374616b652d776974686472617761)))
        
        ;; Update stake amount
        (map-set user-reputation { user: tx-sender, category: category }
          (merge reputation-data { 
            stake-amount: (- (get stake-amount reputation-data) amount),
            last-update: stacks-block-height
          }))
        
        (ok true)
      )
    err-not-found
  )
)

;; Admin functions

;; Add reputation validator
(define-public (add-validator (validator principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set reputation-validators validator true)
    (ok true)
  )
)

;; Remove reputation validator
(define-public (remove-validator (validator principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (map-set reputation-validators validator false)
    (ok true)
  )
)

;; Set category weight
(define-public (set-category-weight (category uint) (weight uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (asserts! (<= category category-service) err-invalid-input)
    (map-set category-weights category weight)
    (ok true)
  )
)

;; Update minimum stake
(define-public (set-min-stake (new-amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-unauthorized)
    (var-set min-stake-amount new-amount)
    (ok new-amount)
  )
)
