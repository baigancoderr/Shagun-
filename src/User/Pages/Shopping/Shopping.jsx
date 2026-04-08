import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "react-toastify";
import jsQR from "jsqr";

const Swap = () => {
  const [vendorName, setVendorName] = useState("");
  const [amount, setAmount] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  const parseScannedData = (decodedText) => {
    let scannedName = decodedText;

    try {
      const parsed = JSON.parse(decodedText);
      scannedName = parsed.vendorName || parsed.name || decodedText;
    } catch {
      scannedName = decodedText;
    }

    setVendorName(scannedName);
    toast.success(`QR scanned: ${scannedName}`);
  };

  const startScanner = async () => {
    if (isScanning) return;

    try {
      setShowScanner(true);
      setIsScanning(true);

      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;

      const cameras = await Html5Qrcode.getCameras();

      if (!cameras || cameras.length === 0) {
        toast.error("No camera found");
        setIsScanning(false);
        return;
      }

      const cameraId = cameras[0].id;

      await html5QrCode.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 230, height: 230 },
          aspectRatio: 1,
        },
        (decodedText) => {
          parseScannedData(decodedText);
          stopScanner();
        },
        () => {}
      );
    } catch (error) {
      console.error("Scanner start error:", error);
      toast.error("Unable to start scanner");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        await scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    } catch (error) {
      console.error("Scanner stop error:", error);
    } finally {
      setIsScanning(false);
      setShowScanner(false);
    }
  };

const handleQrUpload = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    setIsUploading(true);

    const imageUrl = URL.createObjectURL(file);

    const img = new Image();
    img.src = imageUrl;

    img.onload = async () => {
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        context.drawImage(img, 0, 0, img.width, img.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, canvas.width, canvas.height);

        if (code?.data) {
          parseScannedData(code.data);
          toast.success("QR uploaded and scanned successfully");
        } else {
          toast.error("No QR code found in uploaded image");
        }

        URL.revokeObjectURL(imageUrl);
      } catch (err) {
        console.error("Canvas QR scan error:", err);
        toast.error("Unable to process uploaded QR image");
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    };

    img.onerror = () => {
      toast.error("Invalid image file");
      setIsUploading(false);
      e.target.value = "";
      URL.revokeObjectURL(imageUrl);
    };
  } catch (error) {
    console.error("QR upload scan error:", error);
    toast.error("Unable to scan uploaded QR image");
    setIsUploading(false);
    e.target.value = "";
  }
};

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
      }
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const paymentAmount = parseFloat(amount);

    if (!vendorName.trim()) {
      toast.error("Please scan or upload a valid QR");
      return;
    }

    if (!paymentAmount || paymentAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    setIsPaying(true);

    setTimeout(() => {
      setIsPaying(false);
      toast.success(`Payment of ₹${paymentAmount} to ${vendorName} successful`);
      setVendorName("");
      setAmount("");
    }, 1200);
  };

  return (
    <>
      <div className="text-center py-2">
        <h2 className="text-2xl md:text-3xl font-bold text-[#FF6000]">
          Shopping Center
        </h2>
        <p className="text-base text-white mt-2 max-w-lg mx-auto">
          Seamlessly make payments to vendors using multiple convenient methods.
          Fast, Secure, Reliable.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 py-8">
        <div className="w-full sm:w-[250px] rounded-xl border border-[#2a2a2a] bg-[#181818] p-4 theme-card-style border-gradient">
          <h3 className="text-xl font-semibold text-white mt-2 text-center">
            Vendor Name
          </h3>
          <p className="text-sm text-[#888] mt-2 text-center">
            Scan or upload QR
          </p>
        </div>

        <button
          type="button"
          onClick={startScanner}
          className="w-full sm:w-[320px] rounded-xl border border-[#2a2a2a] bg-[#181818] p-4 theme-card-style border-gradient transition-all duration-300 hover:scale-[1.02] text-left"
        >
          <h3 className="text-xl font-semibold text-white mt-2 text-center">
            QR Scan
          </h3>
          <p className="text-sm text-[#888] mt-2 text-center">
            Tap to open camera scanner
          </p>
        </button>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full sm:w-[320px] cursor-pointer rounded-xl border border-[#2a2a2a] bg-[#181818] p-4 theme-card-style border-gradient transition-all duration-300 hover:scale-[1.02]"
        >
          <h3 className="text-xl font-semibold text-white mt-2 text-center">
            QR Upload
          </h3>
          <p className="text-sm text-[#888] mt-2 text-center">
            Upload QR image to scan
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleQrUpload}
          className="hidden"
        />
      </div>

      {showScanner && (
        <div className="max-w-xl mx-auto mb-6 border border-[#2a2a2a] bg-[#181818] rounded-xl p-5">
          <h3 className="text-xl font-semibold text-white text-center mb-4">
            Scan Vendor QR
          </h3>

          <div id="qr-reader" className="overflow-hidden rounded-xl" />

          <button
            type="button"
            onClick={stopScanner}
            className="w-full mt-4 px-4 py-3 rounded-xl border border-gray-600 text-white hover:border-[#FF6000] transition-all duration-300"
          >
            Close Scanner
          </button>
        </div>
      )}

      <div id="qr-upload-reader" className="hidden" />

      <div className="max-w-xl mx-auto border-gradient border p-6 rounded-xl shadow-lg space-y-6">
        <h2 className="text-2xl text-white font-bold text-center">
          Vendor Payment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white font-medium text-sm mb-2">
              Vendor Name
            </label>
            <div className="flex items-center bg-transparent border border-white/10 rounded-md gap-3 px-4 py-3">
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Scan or upload QR to get Vendor Name"
                className="w-full bg-transparent text-white focus:outline-none text-lg"
              />
            </div>

            {vendorName && (
              <p className="text-sm text-green-400 mt-2">
                Vendor Found: <span className="font-semibold">{vendorName}</span>
              </p>
            )}

            {isUploading && (
              <p className="text-sm text-[#FF6000] mt-2">
                Scanning uploaded QR...
              </p>
            )}
          </div>

          <div>
            <label className="block text-white font-medium text-sm mb-2">
              Payment Amount (RS)
            </label>
            <div className="flex items-center bg-transparent border border-white/10 rounded-md gap-3 px-4 py-3">
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter Amount"
                className="w-full bg-transparent text-white focus:outline-none text-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPaying}
            className="w-full py-3 rounded-md font-semibold text-white bg-gradient-to-r from-[#ff6000] to-[#E3090D] hover:from-[#ff7b00] hover:to-[#ff2d55] transition disabled:opacity-50 text-lg mt-4"
          >
            {isPaying ? "Processing Payment..." : "Pay Now"}
          </button>
        </form>
      </div>
    </>
  );
};

export default Swap;