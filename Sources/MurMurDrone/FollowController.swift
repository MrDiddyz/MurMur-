import CoreGraphics

struct RCInput {
    var lr: Int
    var fb: Int
    var ud: Int
    var yaw: Int
}

class FollowController: ObservableObject {
    func updateTarget(box: CGRect) -> RCInput {
        RCInput(lr: 0, fb: 0, ud: 0, yaw: 0)
    }

    func lostFailsafe() -> RCInput {
        RCInput(lr: 0, fb: 0, ud: 0, yaw: 0)
    }
}
