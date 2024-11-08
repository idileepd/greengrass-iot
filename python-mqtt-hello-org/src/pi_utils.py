class RaspberryPiUtils:
    @staticmethod
    def get_serial_number():
        """Retrieve the serial number of the Raspberry Pi."""
        try:
            with open("/proc/cpuinfo", "r") as f:
                for line in f:
                    if line.startswith("Serial"):
                        return line.split(":")[1].strip()
        except FileNotFoundError:
            return "Serial number not found."

    @staticmethod
    def get_mac_address(interface="eth0"):
        """Retrieve the MAC address of the specified network interface."""
        try:
            with open(f"/sys/class/net/{interface}/address", "r") as f:
                return f.read().strip()
        except FileNotFoundError:
            return f"MAC address for interface {interface} not found."
