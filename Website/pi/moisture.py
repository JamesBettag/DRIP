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
# remove possible spaces from mac address
mac_addr.strip()

#
URL = "http://leia.cs.spu.edu:3001/pi/insert"

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
        #print("Raw ADC Value: ", chan.value)
        #print("ADC Voltage: " + str(chan.voltage) + "V")
        data = round(100 - ((chan.value / 65536) * 100), 2)
        PARAMS = { 'mac': mac_addr, 'data': data }
        r = requests.post(url = URL, data = PARAMS)
        if (r.text == "0") :
            print("inserted data: " + str(data))
        elif (r.text == "1") :
            print("this device does not have a registered plant. please go online and create/connect a plant with this device")
        elif (r.text == "2") :
            print("this device has not been registered with your account. please login to your accound and register this device. Device ID: " + mac_addr)

        # pause for 15 minutes
        time.sleep(60 * 60)

except KeyboardInterrupt:
    print("cancel")
    exit()
