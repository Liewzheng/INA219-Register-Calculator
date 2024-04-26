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
        <input type="text" id="resistance" name="resistance" value="{{ request.form['resistance'] }}"><br>
        <label for="current">Max Current (Amps):</label><br>
        <input type="text" id="current" name="current" value="{{ request.form['current'] }}"><br>
        <label for="voltage">Voltage (Volts):</label><br>
        <input type="text" id="voltage" name="voltage" value="{{ request.form['voltage'] }}"><br><br>
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
def calculate():
    result = None
    if request.method == 'POST':
        try:
            resistance = float(request.form['resistance'])
            current = float(request.form['current'])
            voltage = float(request.form['voltage'])
            current_lsb = current / 32768
            cal = int(0.04096 / (current_lsb * resistance))
            config = 0x1F7  # Example fixed value for simplicity
            
            # Generating the LaTeX formulas dynamically
            cal_formula = Markup(f"\\(Cal = trunc(0.04096 / (Current_{{LSB}} \\times {resistance}))\\)")
            current_lsb_formula = Markup(f"\\(Current_{{LSB}} = \\frac{{{current}}}{{32768}} = {current_lsb:.10f} \\, \\text{{A}}\\)")
            
            # Code examples (You would put actual code here)
            python_code = "Python code here"
            c_code = "C code here"
            
            result = {
                'config': f'{config:04X}',
                'calibration': f'{cal:04X}',
                'cal_formula': cal_formula,
                'current_lsb_formula': current_lsb_formula,
                'python_code': python_code,
                'c_code': c_code
            }
        except ValueError:
            result = {'error': 'Invalid input'}

    return render_template_string(HTML, result=result)

if __name__ == '__main__':
    app.run(debug=True)
