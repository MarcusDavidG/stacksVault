;; Time-locked Vault Contract
;; Allows users to deposit STX for a specified lock-duration (in blocks)
;; Funds can only be withdrawn after the lock-duration has passed.

;; --- Constants ---
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-LOCK-ACTIVE (err u101))
(define-constant ERR-LOCK-EXPIRED (err u102))
(define-constant ERR-NO-FUNDS (err u103))
(define-constant ERR-INVALID-LOCK-DURATION (err u104))

;; --- Data Maps ---

;; Map to store vault details for each user
;; key: user principal
;; value: { amount: uint, locked-at: uint, lock-duration: uint }
(define-map vaults
  principal
  {
    amount: uint,
    locked-at: uint,
    lock-duration: uint
  }
)

;; --- Public Functions ---

;; @desc Deposits STX into a time-locked vault for the sender.
;; @param amount: The amount of micro-STX to deposit.
;; @param lock-duration: The duration (in blocks) for which the funds will be locked.
(define-public (deposit (amount uint) (lock-duration uint))
  (begin
    (asserts! (> lock-duration u0) ERR-INVALID-LOCK-DURATION)
    (let
      ( (user tx-sender)
        (current-block-height block-height)
      )
      (asserts! (is-none (map-get? vaults user)) ERR-LOCK-ACTIVE) ; Only one active vault per user
      (try! (stx-transfer? amount user (as-contract tx-sender))) ; Transfer funds to contract
      (map-set vaults user {
        amount: amount,
        locked-at: current-block-height,
        lock-duration: lock-duration
      })
      (print { action: "deposit", user: user, amount: amount, locked-at: current-block-height, lock-duration: lock-duration })
      (ok true)
    )
  )
)

;; @desc Withdraws STX from the time-locked vault after the lock-duration has passed.
(define-public (withdraw)
  (begin
    (let
      ( (user tx-sender)
        (vault (unwrap! (map-get? vaults user) ERR-NO-FUNDS))
        (current-block-height block-height)
      )
      (asserts! (>= current-block-height (+ (get locked-at vault) (get lock-duration vault))) ERR-LOCK-EXPIRED)
      (map-delete vaults user) ; Remove vault entry
      (try! (as-contract (stx-transfer? (get amount vault) tx-sender user))) ; Transfer funds back to user
      (print { action: "withdraw", user: user, amount: (get amount vault) })
      (ok true)
    )
  )
)

;; --- Read-Only Functions ---

;; @desc Gets the details of a user's vault.
;; @param user: The principal of the user.
;; @returns The vault details or none if no vault exists.
(define-read-only (get-vault-info (user principal))
  (map-get? vaults user)
)

;; @desc Checks if a user's vault is currently locked.
;; @param user: The principal of the user.
;; @returns True if locked, false otherwise.
(define-read-only (is-vault-locked (user principal))
  (let ((vault (map-get? vaults user)))
    (if (is-some vault)
      (let ((v (unwrap-panic vault)))
        (ok (< block-height (+ (get locked-at v) (get lock-duration v))))
      )
      (ok false)
    )
  )
)

;; @desc Gets the remaining blocks until a user's vault unlocks.
;; @param user: The principal of the user.
;; @returns The number of blocks remaining, or none if no vault or already unlocked.
(define-read-only (get-remaining-blocks (user principal))
  (let ((vault (map-get? vaults user)))
    (if (is-some vault)
      (let ((v (unwrap-panic vault)))
        (let ((unlock-block (+ (get locked-at v) (get lock-duration v))))
          (if (> unlock-block block-height)
            (ok (- unlock-block block-height))
            (ok u0) ; Already unlocked
          )
        )
      )
      (ok none) ; No vault
    )
  )
)