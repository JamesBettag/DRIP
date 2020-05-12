import time
import busio
import digitalio
import board
import adafruit_mcp3xxx.mcp3008 as MCP
from adafruit_mcp3xxx.analog_in import AnalogIn
import requests
from getmac import get_mac_address

# mac address of device (device id)
mac_addr = get_mac_address()

#
URL = "http://leia.cs.spu.edu:3000/pi/insert"

# create the spi bus
spi = busio.SPI(clock=board.SCK, MISO=board.MISO, MOSI=board.MOSI)

# create the cs (chip select)
cs = digitalio.DigitalInOut(board.D5)

# create the mcp object
mcp = MCP.MCP3008(spi, cs)

# create an analog input channel on pin 0
chan = AnalogIn(mcp, MCP.P0)
try:
    while True:
        print("Raw ADC Value: ", chan.value)
        print("ADC Voltage: " + str(chan.voltage) + "V")
        data = (chan.value / 65536) * 100
        PARAMS = { 'mac': mac_addr, 'data': data }
        r = requests.get(url = URL, params = PARAMS)
        print(r)

        # pause for half a second
        # change to 15 min intervals
        time.sleep(1.5)

except KeyboardInterrupt:
    print("cancel")
    exit()
