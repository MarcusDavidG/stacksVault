;; Subscription Service Contract
;; Allows a contract owner to create subscription tiers and users to subscribe to them.

;; --- Constants ---
(define-constant contract-owner tx-sender)
(define-constant ERR-UNAUTHORIZED (err u100))
(define-constant ERR-TIER-NOT-FOUND (err u101))
(define-constant ERR-ALREADY-SUBSCRIBED (err u102))
(define-constant ERR-SUBSCRIPTION-INACTIVE (err u103))
(define-constant ERR-PAYMENT-NOT-MATCH (err u104))
(define-constant ERR-TIER-ALREADY-EXISTS (err u105))

;; --- Data Variables and Maps ---

;; Map to store subscription tiers
;; key: tier ID (uint)
;; value: { name: (string-ascii 64), price: uint, duration: uint (in blocks) }
(define-map tiers
  uint
  {
    name: (string-ascii 64),
    price: uint,
    duration: uint
  }
)

;; Map to store user subscriptions
;; key: user principal
;; value: { tier-id: uint, subscribed-at: uint (block-height) }
(define-map subscriptions
  principal
  {
    tier-id: uint,
    subscribed-at: uint
  }
)

;; Counter for tier IDs
(define-data-var next-tier-id uint u0)


;; --- Public Functions ---

;; --- Owner Functions ---

;; @desc Creates a new subscription tier
;; @param name: The name of the tier
;; @param price: The subscription price in micro-STX
;; @param duration: The duration of the subscription in blocks
(define-public (create-tier (name (string-ascii 64)) (price uint) (duration uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) ERR-UNAUTHORIZED)
    (let ((tier-id (var-get next-tier-id)))
      (map-set tiers tier-id { name: name, price: price, duration: duration })
      (var-set next-tier-id (+ tier-id u1))
      (ok tier-id)
    )
  )
)

;; @desc Allows the contract owner to withdraw funds
;; @param amount: The amount of micro-STX to withdraw
(define-public (withdraw (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) ERR-UNAUTHORIZED)
    (as-contract (stx-transfer? amount tx-sender contract-owner))
  )
)

;; --- User Functions ---

;; @desc Subscribes a user to a specific tier
;; @param tier-id: The ID of the tier to subscribe to
(define-public (subscribe (tier-id uint))
  (let ((tier (unwrap! (map-get? tiers tier-id) ERR-TIER-NOT-FOUND)))
    (let ((price (get price tier)))
      ;; Transfer the subscription fee from the user to the contract
      (try! (stx-transfer? price tx-sender (as-contract tx-sender)))

      ;; Record the subscription
      (map-set subscriptions tx-sender {
        tier-id: tier-id,
        subscribed-at: block-height
      })
      (print { action: "user-subscribed", user: tx-sender, tier: tier-id })
      (ok true)
    )
  )
)

;; --- Read-Only Functions ---

;; @desc Checks if a user's subscription is currently active
;; @param user: The principal of the user to check
;; @returns (ok bool) or an error if the user is not subscribed
(define-read-only (is-subscription-active (user principal))
  (let ((subscription (unwrap! (map-get? subscriptions user) ERR-SUBSCRIPTION-INACTIVE)))
    (let ((tier (unwrap! (map-get? tiers (get tier-id subscription)) ERR-TIER-NOT-FOUND)))
      (let
        ((subscribed-at (get subscribed-at subscription))
         (duration (get duration tier)))
        (ok (<= (- block-height subscribed-at) duration))
      )
    )
  )
)

;; @desc Retrieves the details of a specific subscription tier
;; @param tier-id: The ID of the tier
;; @returns The tier details or none if not found
(define-read-only (get-tier (tier-id uint))
  (map-get? tiers tier-id)
)

;; @desc Retrieves the subscription details for a specific user
;; @param user: The principal of the user
;; @returns The user's subscription details or none if not subscribed
(define-read-only (get-subscription (user principal))
  (map-get? subscriptions user)
)
