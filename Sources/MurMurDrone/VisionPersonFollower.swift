import CoreGraphics
import CoreVideo

class VisionPersonFollower {
    var onTarget: ((CGRect, Float) -> Void)?
    var onLost: (() -> Void)?

    func process(pixelBuffer: CVPixelBuffer) {}
    func reset() {}
}
