from qr_scanner import scan_qr
from api_client import validate_card


def main():

    print("==============================")
    print(" PTP BUS PAYMENT TERMINAL")
    print("==============================")

    while True:

        print("\nWaiting for passenger card...")

        card_token = scan_qr()

        if not card_token:
            print("Scanner stopped.")
            break

        print("\nCard detected:")
        print(card_token)

        print("\nChecking passenger subscription...")

        status_code, result = validate_card(card_token)

        print("\n==============================")

        if status_code == 200:
            print("ACCESS GRANTED")
            print("Passenger can enter the bus.")

        elif status_code is None:
            print("CONNECTION ERROR")

        else:
            print("ACCESS DENIED")

        print("==============================")

        print("\nServer response:")
        print(result)

        print("\n------------------------------")


if __name__ == "__main__":
    main()