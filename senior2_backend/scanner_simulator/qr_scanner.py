import cv2
from pyzbar.pyzbar import decode


def scan_qr():

    camera = cv2.VideoCapture(0)

    print("==============================")
    print(" PTP BUS SCANNER SIMULATOR ")
    print("==============================")
    print("Waiting for QR card...")

    while True:

        success, frame = camera.read()

        if not success:
            print("Could not access camera.")
            break

        qr_codes = decode(frame)

        for qr in qr_codes:

            card_token = qr.data.decode("utf-8")

            print("\nQR DETECTED:")
            print(card_token)

            camera.release()
            cv2.destroyAllWindows()

            return card_token

        cv2.imshow(
            "PTP Scanner Camera",
            frame
        )

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    camera.release()
    cv2.destroyAllWindows()

    return None


if __name__ == "__main__":
    scan_qr()