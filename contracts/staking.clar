;; staking contract

(define-constant ERR_INSUFFICIENT_BALANCE (err u100))
(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_UNAUTHORIZED (err u102))

(define-data-var stake-amount uint u1000000) ;; 1 STX

(define-map stakers principal uint)

(define-public (stake)
  (let ((balance (stx-get-balance tx-sender)))
    (asserts! (>= balance (var-get stake-amount)) ERR_INSUFFICIENT_BALANCE)
    (try! (stx-transfer? (var-get stake-amount) tx-sender (as-contract tx-sender)))
    (map-set stakers tx-sender (+ (default-to u0 (map-get? stakers tx-sender)) (var-get stake-amount)))
    (ok true)))

(define-public (unstake (amount uint))
  (let ((staked-amount (default-to u0 (map-get? stakers tx-sender))))
    (asserts! (>= staked-amount amount) ERR_INSUFFICIENT_BALANCE)
    (try! (as-contract (stx-transfer? amount tx-sender tx-sender)))
    (map-set stakers tx-sender (- staked-amount amount))
    (ok true)))

(define-read-only (get-stake (staker principal))
  (ok (default-to u0 (map-get? stakers staker))))

(define-public (slash (staker principal) (amount uint))
  (let ((staked-amount (default-to u0 (map-get? stakers staker))))
    (asserts! (>= staked-amount amount) ERR_INSUFFICIENT_BALANCE)
    (map-set stakers staker (- staked-amount amount))
    (ok true)))
