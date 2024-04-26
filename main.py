from flask import Flask, request, render_template_string
from markupsafe import Markup  # 正确的导入语句

app = Flask(__name__)

HTML = """
<!doctype html>
<html>
<head>
    <title>INA219 Register Calculator</title>
    <script src="https://polyfill.io/v3/polyfill.min.js?features=es6"></script>
    <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
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
            <li>{{ result['cal_formula'] | safe }}</li>
            <li>{{ result['current_lsb_formula'] | safe }}</li>
        </ul>
        <h3>Python Code Example:</h3>
        <pre>{{ result['python_code'] }}</pre>
        <h3>C Code Example:</h3>
        <pre>{{ result['c_code'] }}</pre>
    {% endif %}
</body>
</html>
"""

@app.route('/', methods=['GET', 'POST'])
@app.route('/', methods=['GET', 'POST'])
def calculate():
    # Set default values
    resistance = '0.3'
    current = '1.0'
    voltage = '3.7'
    result = None

    if request.method == 'POST':
        # Get the form values and convert to float
        resistance_str = request.form.get('resistance', '0.3')
        current_str = request.form.get('current', '1.0')
        voltage_str = request.form.get('voltage', '3.7')
        try:
            # Convert to float for calculation
            resistance = float(resistance_str)
            current = float(current_str)
            voltage = float(voltage_str)

            # Perform calculations
            current_lsb = current / 32768
            cal = int(0.04096 / (current_lsb * resistance))
            config = 0x1F7  # Example fixed value for simplicity
            
            # Generate the LaTeX formulas dynamically
            cal_formula = Markup(f"\\(Cal = trunc(0.04096 / (Current_{{LSB}} \\times {resistance}))\\)")
            current_lsb_formula = Markup(f"\\(Current_{{LSB}} = \\frac{{{current}}}{{32768}} = {current_lsb:.10f} \\, \\text{{A}}\\)")
            
            # Code examples (You would put actual code here)
            python_code = "Python code here"
            c_code = "C code here"
            
            # Build result dictionary
            result = {
                'config': f'{config:04X}',
                'calibration': f'{cal:04X}',
                'cal_formula': cal_formula,
                'current_lsb_formula': current_lsb_formula,
                'python_code': python_code,
                'c_code': c_code,
                'resistance': resistance_str,
                'current': current_str,
                'voltage': voltage_str
            }
        except ValueError:
            result = {
                'error': 'Invalid input',
                'resistance': resistance_str,
                'current': current_str,
                'voltage': voltage_str
            }

    # Render the template
    return render_template_string(HTML, result=result)


    return render_template_string(HTML, result=result, resistance=resistance, current=current, voltage=voltage)

if __name__ == '__main__':
    app.run(debug=True)
