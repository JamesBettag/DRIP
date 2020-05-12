import time
import busio
import digitalio
import board
import adafruit_mcp3xxx.mcp3008 as MCP
from adafruit_mcp3xxx.analog_in import AnalogIn
import requests

# sensor ID (from user)
plant_id = 1

# create the spi bus
spi = busio.SPI(clock=board.SCK, MISO=board.MISO, MOSI=board.MOSI)

# create the cs (chip select)
cs = digitalio.DigitalInOut(board.D5)

# create the mcp object
mcp = MCP.MCP3008(spi, cs)

# create an analog input channel on pin 0
chan = AnalogIn(mcp, MCP.P0)

#insert query
insert_data = ("INSERT INTO data (plant_id, moisture) VALUES (%s, %s)")

# create mysql connection
try:
    #cnx = mysql.connector.connect(user='bettagj', password='Password0*', host='leia.cs.spu.edu', port='3306', database='gms', auth_plugin='mysql_native_password')
    cnx = pymysql.connect('leia.cs.spu.edu', 'bettagj', 'Password0*', 'gms')
    cursor = cnx.cursor()

    while True:
        print("Raw ADC Value: ", chan.value)
        print("ADC Voltage: " + str(chan.voltage) + "V")
        data = (plant_id, chan.value)
        cursor.execute(insert_data, data)
        cnx.commit()

        # pause for half a second
        # change to 15 min intervals
        time.sleep(1.5)

except mysql.connector.Error as error:
    print("mysql error", error)

except KeyboardInterrupt:
    print("cancel")
    cnx.close()
