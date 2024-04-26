from flask import Flask, request, render_template_string

app = Flask(__name__)

HTML = """
<!doctype html>
<html>
<head>
    <title>INA219 Register Calculator</title>
</head>
<body>
    <h2>INA219 Register Calculator</h2>
    <form action="" method="post">
        <label for="resistance">Shunt Resistance (Ohms):</label><br>
        <input type="text" id="resistance" name="resistance" value="{{ resistance }}"><br>
        <label for="current">Max Current (Amps):</label><br>
        <input type="text" id="current" name="current" value="{{ current }}"><br>
        <label for="voltage">Voltage (Volts):</label><br>
        <input type="text" id="voltage" name="voltage" value="{{ voltage }}"><br><br>
        <input type="submit" value="Calculate">
    </form>
    {% if result %}
        <h3>Results:</h3>
        <p>Configuration Register (0x00): {{ result['config'] }} (Hex)</p>
        <p>Calibration Register (0x05): {{ result['calibration'] }} (Hex)</p>
        <p>Calculation Details:</p>
        <ul>
            <li>Cal = trunc(0.04096 / (Current_LSB * Rshunt))</li>
            <li>Current_LSB = Max Current / 32768</li>
        </ul>
    {% endif %}
</body>
</html>
"""

@app.route('/', methods=['GET', 'POST'])
def calculate():
    resistance = request.form.get('resistance', '0.3')
    current = request.form.get('current', '1')
    voltage = request.form.get('voltage', '3.7')
    result = None
    
    if request.method == 'POST':
        try:
            resistance = float(resistance)
            current = float(current)
            voltage = float(voltage)
            current_lsb = current / 32768
            cal = int(0.04096 / (current_lsb * resistance))
            config = 0x1F7  # Example fixed value for simplicity

            result = {
                'config': f'{config:04X}',
                'calibration': f'{cal:04X}'
            }
        except ValueError:
            result = {'error': 'Invalid input'}

    return render_template_string(HTML, result=result, resistance=resistance, current=current, voltage=voltage)

if __name__ == '__main__':
    app.run(debug=True)
