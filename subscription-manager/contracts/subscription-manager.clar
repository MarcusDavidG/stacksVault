;; Subscription Manager - Recurring payment management
;; Built for Stacks mainnet deployment by Marcus David

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-unauthorized (err u100))
(define-constant err-invalid-input (err u101))
(define-constant err-not-found (err u102))
(define-constant err-subscription-inactive (err u103))
(define-constant err-payment-failed (err u104))
(define-constant err-already-exists (err u105))

;; Subscription status constants
(define-constant status-active u0)
(define-constant status-paused u1)
(define-constant status-cancelled u2)

;; Data Variables
(define-data-var total-subscriptions uint u0)
(define-data-var total-services uint u0)
(define-data-var platform-fee uint u200) ;; 2%

;; Data Maps
(define-map subscription-services
  uint
  {
    provider: principal,
    name: (string-ascii 64),
    description: (string-ascii 256),
    price-per-period: uint,
    period-length: uint, ;; in blocks
    max-subscribers: uint,
    current-subscribers: uint,
    active: bool,
    category: (string-ascii 32)
  }
)

(define-map user-subscriptions
  { service-id: uint, subscriber: principal }
  {
    start-block: uint,
    last-payment-block: uint,
    next-payment-block: uint,
    status: uint,
    total-payments: uint,
    auto-renew: bool
  }
)

(define-map service-subscribers uint (list 1000 principal))
(define-map user-services principal (list 50 uint))

(define-map payment-history
  uint
  {
    service-id: uint,
    subscriber: principal,
    amount: uint,
    block-height: uint,
    period-start: uint,
    period-end: uint
  }
)

(define-data-var payment-counter uint u0)

;; Read-only functions
(define-read-only (get-service (service-id uint))
  (map-get? subscription-services service-id)
)

(define-read-only (get-subscription (service-id uint) (subscriber principal))
  (map-get? user-subscriptions { service-id: service-id, subscriber: subscriber })
)

(define-read-only (get-user-services (user principal))
  (default-to (list) (map-get? user-services user))
)

(define-read-only (get-service-subscribers (service-id uint))
  (default-to (list) (map-get? service-subscribers service-id))
)

(define-read-only (is-subscription-active (service-id uint) (subscriber principal))
  (match (map-get? user-subscriptions { service-id: service-id, subscriber: subscriber })
    subscription-data
      (and 
        (is-eq (get status subscription-data) status-active)
        (<= (get next-payment-block subscription-data) stacks-block-height)
      )
    false
  )
)

(define-read-only (get-subscription-stats)
  (ok {
    total-subscriptions: (var-get total-subscriptions),
    total-services: (var-get total-services),
    platform-fee: (var-get platform-fee)
  })
)

;; Public functions

;; Create subscription service
(define-public (create-service 
  (name (string-ascii 64))
  (description (string-ascii 256))
  (price-per-period uint)
  (period-length uint)
  (max-subscribers uint)
  (category (string-ascii 32))
)
  (let 
    (
      (service-id (var-get total-services))
    )
    (asserts! (> price-per-period u0) err-invalid-input)
    (asserts! (> period-length u0) err-invalid-input)
    (asserts! (> max-subscribers u0) err-invalid-input)
    
    ;; Store service
    (map-set subscription-services service-id {
      provider: tx-sender,
      name: name,
      description: description,
      price-per-period: price-per-period,
      period-length: period-length,
      max-subscribers: max-subscribers,
      current-subscribers: u0,
      active: true,
      category: category
    })
    
    (var-set total-services (+ service-id u1))
    (ok service-id)
  )
)

;; Subscribe to service
(define-public (subscribe (service-id uint) (auto-renew bool))
  (match (map-get? subscription-services service-id)
    service-data
      (let 
        (
          (subscribers (default-to (list) (map-get? service-subscribers service-id)))
          (user-services-list (default-to (list) (map-get? user-services tx-sender)))
          (price (get price-per-period service-data))
          (platform-fee-amount (/ (* price (var-get platform-fee)) u10000))
          (provider-amount (- price platform-fee-amount))
          (next-payment (+ stacks-block-height (get period-length service-data)))
          (payment-id (var-get payment-counter))
        )
        (asserts! (get active service-data) err-subscription-inactive)
        (asserts! (< (get current-subscribers service-data) (get max-subscribers service-data)) err-invalid-input)
        (asserts! (is-none (map-get? user-subscriptions { service-id: service-id, subscriber: tx-sender })) err-already-exists)
        
        ;; Process payment
        (try! (stx-transfer-memo? price tx-sender (get provider service-data) 0x737562736372697074696f6e2d7061796d656e74))
        (try! (stx-transfer-memo? platform-fee-amount tx-sender contract-owner 0x706c6174666f726d2d666565))
        
        ;; Create subscription
        (map-set user-subscriptions { service-id: service-id, subscriber: tx-sender } {
          start-block: stacks-block-height,
          last-payment-block: stacks-block-height,
          next-payment-block: next-payment,
          status: status-active,
          total-payments: u1,
          auto-renew: auto-renew
        })
        
        ;; Update service subscriber count
        (map-set subscription-services service-id 
          (merge service-data { current-subscribers: (+ (get current-subscribers service-data) u1) }))
        
        ;; Add to lists
        (map-set service-subscribers service-id 
          (unwrap-panic (as-max-len? (append subscribers tx-sender) u1000)))
        (map-set user-services tx-sender 
          (unwrap-panic (as-max-len? (append user-services-list service-id) u50)))
        
        ;; Record payment
        (map-set payment-history payment-id {
          service-id: service-id,
          subscriber: tx-sender,
          amount: price,
          block-height: stacks-block-height,
          period-start: stacks-block-height,
          period-end: next-payment
        })
        
        (var-set payment-counter (+ payment-id u1))
        (var-set total-subscriptions (+ (var-get total-subscriptions) u1))
        (ok service-id)
      )
    err-not-found
  )
)

;; Renew subscription
(define-public (renew-subscription (service-id uint))
  (match (map-get? subscription-services service-id)
    service-data
      (match (map-get? user-subscriptions { service-id: service-id, subscriber: tx-sender })
        subscription-data
          (let 
            (
              (price (get price-per-period service-data))
              (platform-fee-amount (/ (* price (var-get platform-fee)) u10000))
              (provider-amount (- price platform-fee-amount))
              (new-next-payment (+ stacks-block-height (get period-length service-data)))
              (payment-id (var-get payment-counter))
            )
            (asserts! (is-eq (get status subscription-data) status-active) err-subscription-inactive)
            (asserts! (get active service-data) err-subscription-inactive)
            
            ;; Process payment
            (try! (stx-transfer-memo? price tx-sender (get provider service-data) 0x737562736372697074696f6e2d72656e6577616c))
            (try! (stx-transfer-memo? platform-fee-amount tx-sender contract-owner 0x706c6174666f726d2d666565))
            
            ;; Update subscription
            (map-set user-subscriptions { service-id: service-id, subscriber: tx-sender }
              (merge subscription-data {
                last-payment-block: stacks-block-height,
                next-payment-block: new-next-payment,
                total-payments: (+ (get total-payments subscription-data) u1)
              }))
            
            ;; Record payment
            (map-set payment-history payment-id {
              service-id: service-id,
              subscriber: tx-sender,
              amount: price,
              block-height: stacks-block-height,
              period-start: stacks-block-height,
              period-end: new-next-payment
            })
            
            (var-set payment-counter (+ payment-id u1))
            (ok true)
          )
        err-not-found
      )
    err-not-found
  )
)

;; Cancel subscription
(define-public (cancel-subscription (service-id uint))
  (match (map-get? user-subscriptions { service-id: service-id, subscriber: tx-sender })
    subscription-data
      (match (map-get? subscription-services service-id)
        service-data
          (begin
            (asserts! (is-eq (get status subscription-data) status-active) err-subscription-inactive)
            
            ;; Update subscription status
            (map-set user-subscriptions { service-id: service-id, subscriber: tx-sender }
              (merge subscription-data { status: status-cancelled }))
            
            ;; Update service subscriber count
            (map-set subscription-services service-id 
              (merge service-data { current-subscribers: (- (get current-subscribers service-data) u1) }))
            
            (ok true)
          )
        err-not-found
      )
    err-not-found
  )
)

;; Pause subscription
(define-public (pause-subscription (service-id uint))
  (match (map-get? user-subscriptions { service-id: service-id, subscriber: tx-sender })
    subscription-data
      (begin
        (asserts! (is-eq (get status subscription-data) status-active) err-subscription-inactive)
        
        (map-set user-subscriptions { service-id: service-id, subscriber: tx-sender }
          (merge subscription-data { status: status-paused }))
        (ok true)
      )
    err-not-found
  )
)

;; Resume subscription
(define-public (resume-subscription (service-id uint))
  (match (map-get? user-subscriptions { service-id: service-id, subscriber: tx-sender })
    subscription-data
      (begin
        (asserts! (is-eq (get status subscription-data) status-paused) err-invalid-input)
        
        (map-set user-subscriptions { service-id: service-id, subscriber: tx-sender }
          (merge subscription-data { status: status-active }))
        (ok true)
      )
    err-not-found
  )
)

;; Admin functions

;; Deactivate service (provider only)
(define-public (deactivate-service (service-id uint))
  (match (map-get? subscription-services service-id)
    service-data
      (begin
        (asserts! (is-eq tx-sender (get provider service-data)) err-unauthorized)
        
        (map-set subscription-services service-id 
          (merge service-data { active: false }))
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
