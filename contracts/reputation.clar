;; reputation contract

(define-constant ERR_NOT_FOUND (err u101))
(define-constant ERR_UNAUTHORIZED (err u102))

(define-map reputations principal
  {
    score: int,
    total-verifications: uint,
    correct-verifications: uint
  })

(define-public (update-reputation (user principal) (is-correct bool))
  (let ((current-rep (default-to { score: 0, total-verifications: u0, correct-verifications: u0 } (map-get? reputations user))))
    (map-set reputations user
      (merge current-rep
        {
          score: (+ (get score current-rep) (if is-correct 1 -1)),
          total-verifications: (+ (get total-verifications current-rep) u1),
          correct-verifications: (+ (get correct-verifications current-rep) (if is-correct u1 u0))
        }))
    (ok true)))

(define-read-only (get-reputation (user principal))
  (ok (default-to { score: 0, total-verifications: u0, correct-verifications: u0 } (map-get? reputations user))))

