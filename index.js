
/*-----------------------------------------------------------------------------
 * GLOBAL VARIABLES
 ----------------------------------------------------------------------------*/
reg_0x00 = 0x399F;

reg_0x00_dict = {
    "bit15": {
        "name": "RST",
        "value": "0"
    },
    "bit14": {
        "name": "RESERVED",
        "value": "0"
    },
    "bit13": {
        "name": "BRNG",
        "value": "1"
    },
    "bit12": {
        "name": "PG1",
        "value": "1"
    },
    "bit11": {
        "name": "PG0",
        "value": "1"
    },
    "bit10": {
        "name": "BADC4",
        "value": "0"
    },
    "bit9": {
        "name": "BADC3",
        "value": "0"
    },
    "bit8": {
        "name": "BADC2",
        "value": "1"
    },
    "bit7": {
        "name": "BADC1",
        "value": "1"
    },
    "bit6": {
        "name": "SADC4",
        "value": "0"
    },
    "bit5": {
        "name": "SADC3",
        "value": "0"
    },
    "bit4": {
        "name": "SADC2",
        "value": "1"
    },
    "bit3": {
        "name": "SADC1",
        "value": "1"
    },
    "bit2": {
        "name": "MODE3",
        "value": "1"
    },
    "bit1": {
        "name": "MODE2",
        "value": "1"
    },
    "bit0": {
        "name": "MODE1",
        "value": "1"
    }
};

ina219_mode_dict = {
    "mode0": "Power-down",
    "mode1": "Shunt voltage, triggered",
    "mode2": "Bus voltage, triggered",
    "mode3": "Shunt and bus, triggered",
    "mode4": "ADC off (disabled)",
    "mode5": "Shunt voltage, continuous",
    "mode6": "Bus voltage, continuous",
    "mode7": "Shunt and bus, continuous"
};

var global_shunt_resistor = 0.3;
var global_max_voltage = 3.8;
var global_max_current = 1;

python_code = `
#!/usr/bin/env python
# 导入必要的库
import smbus
import time

# 假设您有一个名为SMBus的类可以用来与I2C设备通信
bus = smbus.SMBus(1)  # 1表示 /dev/i2c-1
DEVICE_ADDRESS = 0x40  # INA219的默认I2C地址

# INA219的寄存器地址
REG_CONFIG = 0x00
REG_SHUNT_VOLTAGE = 0x01
REG_BUS_VOLTAGE = 0x02
REG_POWER = 0x03
REG_CURRENT = 0x04
REG_CALIBRATION = 0x05

# INA219的配置和校准值（这些值将根据您的实际应用进行计算和设置）
config_value = 0x1F7
cal_value = 0x1179

# 将计算得到的配置和校准值写入INA219
bus.write_word_data(DEVICE_ADDRESS, REG_CONFIG, config_value)
bus.write_word_data(DEVICE_ADDRESS, REG_CALIBRATION, cal_value)

# 读取和转换数值的函数
def read_ina219():
    # 读取测量值
    shunt_voltage = bus.read_word_data(DEVICE_ADDRESS, REG_SHUNT_VOLTAGE)
    bus_voltage = bus.read_word_data(DEVICE_ADDRESS, REG_BUS_VOLTAGE)
    current = bus.read_word_data(DEVICE_ADDRESS, REG_CURRENT)
    power = bus.read_word_data(DEVICE_ADDRESS, REG_POWER)
    
    # 数据转换（具体转换依赖于您的配置和校准值）
    shunt_voltage = shunt_voltage * 0.01  # 例子: 10uV per bit
    bus_voltage = (bus_voltage >> 3) * 4  # 例子: 4mV per bit, 右移3位去掉无效位
    current = current * current_lsb_value  # current_lsb_value是根据您的校准值计算得到的
    power = power * power_lsb_value  # power_lsb_value是根据您的校准值计算得到的

    return shunt_voltage, bus_voltage, current, power

# 主程序示例
def main():
    while True:
        shunt_voltage, bus_voltage, current, power = read_ina219()
        print(f"Shunt Voltage: {shunt_voltage} mV")
        print(f"Bus Voltage: {bus_voltage / 1000} V")
        print(f"Current: {current} mA")
        print(f"Power: {power} mW")
        time.sleep(1)  # 读取间隔1秒

if __name__ == '__main__':
    main()

`;

/*-----------------------------------------------------------------------------
 * FUNCTIONS
 ----------------------------------------------------------------------------*/

/**
 * 处理输入框的输入事件
 * @param {*} event 
 */
function handleInputChange(event) {
    // 打印输入的值
    console.log(`Input changed to: ${event.target.value}`);

    let inputValue = event.target.value;
    if (inputValue === '0' || inputValue === '1') {
        // 先获取包含input的td元素，再获取cellIndex
        let tdElement = event.target.parentElement;
        let bitPosition = tdElement.cellIndex;

        updateRegister(inputValue, bitPosition);
    } else {
        // 如果输入非法，可以考虑恢复原值或给出提示
        event.target.value = event.target.dataset.prevValue || '';
    }
}

/**
 * 更新 reg_0x00 的值
 * @param {*} bitValue 
 * @param {*} bitPosition 
 */
function updateRegister(bitValue, bitPosition) {

    // 将二进制位插入到reg_0x00的对应位置
    reg_0x00 &= ~(1 << (15 - bitPosition)); // 清除对应位置的旧值
    reg_0x00 |= (bitValue === '1' ? 1 : 0) << (15 - bitPosition); // 设置新值
    // 可以在这里添加更多处理，如显示更新后的reg_0x00值
    console.log(`reg_0x00 updated to: 0x${reg_0x00.toString(16).toUpperCase()}`);

    update_reg_0x00();
    
    update_formula();
}

/**
 * 创建一个表格，用于显示0x00寄存器的位域
 * @param {*} elementId 
 */
function create_reg_0x00_table(elementId) {
    var table = document.createElement('table');
    table.style.maxWidth = '80%';
    table.style.width = '80%'; // 修改为小写的 width
    // Create table header row
    var thead = table.createTHead();
    var headerRow = thead.insertRow();
    for (var i = 15; i >= 0; i--) {
        var th = document.createElement('th');
        th.textContent = reg_0x00_dict['bit' + i]['name'];
        headerRow.appendChild(th);
    }
    // Create input row
    var tbody = table.createTBody();
    var inputRow = tbody.insertRow();
    for (var j = 15; j >= 0; j--) {
        var td = inputRow.insertCell();
        td.style.textAlign = 'center'; // 居中对齐单元格内容
        var input = document.createElement('input');
        input.type = 'text';
        input.size = 1;
        input.maxLength = 1;
        input.pattern = '[01]';
        input.value = reg_0x00_dict['bit' + j]['value'];
        input.title = 'Please enter either 0 or 1.';
        input.addEventListener('input', handleInputChange);
        input.dataset.prevValue = ''; // 用于存储上一次输入的值
        input.style.textAlign = 'center'; // 居中对齐输入框内容
        input.style.border = 'none'; // 隐藏边框
        input.style.width = '100%'; // 宽度100%
        td.appendChild(input);
    }
    // Append the table to the div
    document.getElementById(elementId).appendChild(table);
}

/**
 * 创建一个表单，用于输入shunt resistor、maximum voltage和maximum current
 * @param {*} elementId
 * @returns
 * @description
 * 1. 创建一个form元素
 * 2. 创建三个input元素，分别用于输入shunt resistor、maximum voltage和maximum current
 * 3. 添加一个submit按钮
 * 4. 将form元素添加到目标容器中
 */
function createForm(elementId) {
    // 获取目标元素
    var container = document.getElementById(elementId);
    container.style.margin = '10px';

    // 创建一个form元素
    var form = document.createElement('form');

    var div_shunt_resistor = document.createElement('div');
    div_shunt_resistor.style.margin = '10px';
    div_shunt_resistor.innerHTML = 'Shunt Resistor (ohms):';
    form.appendChild(div_shunt_resistor);

    var div_max_voltage = document.createElement('div');
    div_max_voltage.style.margin = '10px';
    div_max_voltage.innerHTML = 'Maximum Voltage (V):';
    form.appendChild(div_max_voltage);

    var div_max_current = document.createElement('div');
    div_max_current.style.margin = '10px';
    div_max_current.innerHTML = 'Maximum Current (Amps):';
    form.appendChild(div_max_current);

    // 创建第一个input用于输入shunt resistor
    var shuntResistorInput = document.createElement('input');
    shuntResistorInput.type = 'number';
    shuntResistorInput.placeholder = 'Shunt Resistor (ohms)';
    shuntResistorInput.required = true; // 设置为必填项
    shuntResistorInput.min = 0.01; // 设置最小值为0
    shuntResistorInput.max = 1000; // 设置最大值为1000
    shuntResistorInput.value = 0.3;
    shuntResistorInput.step = 0.01;
    shuntResistorInput.style.width = '5%';
    div_shunt_resistor.appendChild(shuntResistorInput);

    // 创建第二个input用于输入maximum voltage
    var maxVoltageInput = document.createElement('input');
    maxVoltageInput.type = 'number';
    maxVoltageInput.placeholder = 'Maximum Voltage (V)';
    maxVoltageInput.required = true; // 设置为必填项
    maxVoltageInput.min = 0; // 设置最小值为0
    maxVoltageInput.max = 26; // 设置最大值为5
    maxVoltageInput.value = 3.8;
    maxVoltageInput.step = 0.1;
    maxVoltageInput.style.width = '5%';
    div_max_voltage.appendChild(maxVoltageInput);

    // 创建第三个input用于输入maximum current
    var maxCurrentInput = document.createElement('input');
    maxCurrentInput.type = 'number';
    maxCurrentInput.placeholder = 'Maximum Current (Amps)';
    maxCurrentInput.required = true; // 设置为必填项
    maxCurrentInput.min = 0; // 设置最小值为0
    maxCurrentInput.max = 5; // 设置最大值为5
    maxCurrentInput.value = 1;
    maxCurrentInput.step = 0.1;
    maxCurrentInput.style.width = '5%';
    div_max_current.appendChild(maxCurrentInput);

    // 添加input监听器
    shuntResistorInput.addEventListener('input', function () {
        global_shunt_resistor = parseFloat(shuntResistorInput.value);
        update_formula();
        console.log('global_shunt_resistor updated:', global_shunt_resistor);
    });

    maxVoltageInput.addEventListener('input', function () {
        global_max_voltage = parseFloat(maxVoltageInput.value);
        update_formula();
        console.log('global_max_voltage updated:', global_max_voltage);
    });

    maxCurrentInput.addEventListener('input', function () {
        global_max_current = parseFloat(maxCurrentInput.value);
        update_formula();
        console.log('global_max_current updated:', global_max_current);
    });

    // 将form元素添加到目标容器中
    container.appendChild(form);
}


/**
 * 更新公式
 * @description
 * formula_1:
 *   Current_{LSB} = \frac{global_max_current}{2^{15}} A = \frac{global_max_current}{32768} A 
 * formula_2:
 *   Calibration Value = \frac{0.04096}{Current_{LSB} \times global_shunt_resistor} = \frac{0.04096}{\frac{global_max_current}{32768} \times global_shunt_resistor}
 */
function update_formula() {
    current_lsb = global_max_current / 32768;
    calibration_value = 0.04096 / (current_lsb * global_shunt_resistor);
    document.getElementById('formula_1').innerHTML = `\\\( Current_{LSB} = \\frac{${global_max_current}}{2^{15}} A = \\frac{${global_max_current}}{32768} A = ${current_lsb} A\\\)`;
    document.getElementById('formula_2').innerHTML = `\\\( Calibration Value = \\frac{0.04096}{Current_{LSB} \\times ${global_shunt_resistor}} = \\frac{0.04096}{\\frac{${global_max_current}}{32768} \\times ${global_shunt_resistor}} = ${calibration_value} = 0x${(Math.floor(calibration_value) >>> 0).toString(16).padStart(4, '0').toUpperCase()}\\\)`;
    MathJax.typeset();
}

function update_python_code() {
    document.getElementById('python_code').innerHTML = python_code;
}

/*
 * 修改元素的文本内容
 */
function update_reg_0x00() {

    document.getElementById('reg_0x00').innerHTML = "";

    var reg_0x00_reset_div = document.createElement('div');
    reg_0x00_reset_div.className = 'reg_0x00_bit';

    var reg_0x00_reset_label = document.createElement('span');
    reg_0x00_reset_div.appendChild(reg_0x00_reset_label);
    reg_0x00_reset_label.innerHTML = '- (RST) Power on Reset: ';
    reg_0x00_reset_label.style.fontWeight = 'bold';

    var reg_0x00_reset_value = document.createElement('span');
    reg_0x00_reset_div.appendChild(reg_0x00_reset_value);
    reg_0x00_reset = (reg_0x00 >> 15 == 1) ? "Enable" : "Disable";
    reg_0x00_reset_value.innerHTML = reg_0x00_reset;
    reg_0x00_reset_value.style.color = reg_0x00_reset ? 'green' : 'red';

    document.getElementById('reg_0x00').appendChild(reg_0x00_reset_div);

    var reg_0x00_brng_div = document.createElement('div');
    reg_0x00_brng_div.className = 'reg_0x00_bit';

    var reg_0x00_brng_label = document.createElement('span');
    reg_0x00_brng_div.appendChild(reg_0x00_brng_label);
    reg_0x00_brng_label.innerHTML = '- (BRNG) Bus Voltage Range: ';
    reg_0x00_brng_label.style.fontWeight = 'bold';

    var reg_0x00_brng_value = document.createElement('span');
    reg_0x00_brng_div.appendChild(reg_0x00_brng_value);
    reg_0x00_brng = (( (reg_0x00 & 0x2000) >> 13) == 1) ? "32V" : "16V";
    reg_0x00_brng_value.innerHTML = reg_0x00_brng;

    document.getElementById('reg_0x00').appendChild(reg_0x00_brng_div);

    var reg_0x00_pga_gain_div = document.createElement('div');
    reg_0x00_pga_gain_div.className = 'reg_0x00_bit';

    var reg_0x00_pga_gain_label = document.createElement('span');
    reg_0x00_pga_gain_div.appendChild(reg_0x00_pga_gain_label);
    reg_0x00_pga_gain_label.innerHTML = '- (PGA) Gain: ';
    reg_0x00_pga_gain_label.style.fontWeight = 'bold';

    var reg_0x00_pga_gain_value = document.createElement('span');
    reg_0x00_pga_gain_div.appendChild(reg_0x00_pga_gain_value);
    reg_0x00_pga_gain = Math.pow(2, ((reg_0x00 & 0x1800) >> 11));
    reg_0x00_pga_gain_value.innerHTML = reg_0x00_pga_gain;

    document.getElementById('reg_0x00').appendChild(reg_0x00_pga_gain_div);

    var reg_0x00_pga_range_div = document.createElement('div');
    reg_0x00_pga_range_div.className = 'reg_0x00_bit';

    var reg_0x00_pga_range_label = document.createElement('span');
    reg_0x00_pga_range_div.appendChild(reg_0x00_pga_range_label);
    reg_0x00_pga_range_label.innerHTML = '- (PGA) Range: ';
    reg_0x00_pga_range_label.style.fontWeight = 'bold';

    var reg_0x00_pga_range_value = document.createElement('span');
    reg_0x00_pga_range_div.appendChild(reg_0x00_pga_range_value);
    reg_0x00_pga_range = reg_0x00_pga_gain * 40;
    reg_0x00_pga_range_value.innerHTML = reg_0x00_pga_range;

    document.getElementById('reg_0x00').appendChild(reg_0x00_pga_range_div);
    
    var reg_0x00_badc_div = document.createElement('div');
    reg_0x00_badc_div.className = 'reg_0x00_bit';

    var reg_0x00_badc_label = document.createElement('span');
    reg_0x00_badc_div.appendChild(reg_0x00_badc_label);
    reg_0x00_badc_label.innerHTML = '- (BADC) Bus ADC Resolution: ';
    reg_0x00_badc_label.style.fontWeight = 'bold';

    var reg_0x00_badc_value = document.createElement('span');
    reg_0x00_badc_div.appendChild(reg_0x00_badc_value);
    reg_0x00_badc = (reg_0x00 & 0x0780) >> 7;
    reg_0x00_badc_value.innerHTML = reg_0x00_badc;

    document.getElementById('reg_0x00').appendChild(reg_0x00_badc_div);

    var reg_0x00_sadc_div = document.createElement('div');
    reg_0x00_sadc_div.className = 'reg_0x00_bit';

    var reg_0x00_sadc_label = document.createElement('span');
    reg_0x00_sadc_div.appendChild(reg_0x00_sadc_label);
    reg_0x00_sadc_label.innerHTML = '- (SADC) Shunt ADC Resolution: ';
    reg_0x00_sadc_label.style.fontWeight = 'bold';

    var reg_0x00_sadc_value = document.createElement('span');
    reg_0x00_sadc_div.appendChild(reg_0x00_sadc_value);
    reg_0x00_sadc = (reg_0x00 & 0x0078) >> 3;
    reg_0x00_sadc_value.innerHTML = reg_0x00_sadc;

    document.getElementById('reg_0x00').appendChild(reg_0x00_sadc_div);

    var reg_0x00_mode_div = document.createElement('div');
    reg_0x00_mode_div.className = 'reg_0x00_bit';

    var reg_0x00_mode_label = document.createElement('span');
    reg_0x00_mode_div.appendChild(reg_0x00_mode_label);
    reg_0x00_mode_label.innerHTML = '- (MODE) Operating Mode: ';
    reg_0x00_mode_label.style.fontWeight = 'bold';

    var reg_0x00_mode_value = document.createElement('span');
    reg_0x00_mode_div.appendChild(reg_0x00_mode_value);
    reg_0x00_mode = ina219_mode_dict['mode'+ (reg_0x00 & 0x0007)];
    reg_0x00_mode_value.innerHTML = reg_0x00_mode;

    document.getElementById('reg_0x00').appendChild(reg_0x00_mode_div);

    var reg_0x00_value_div = document.createElement('div');

    var reg_0x00_value_label = document.createElement('span');
    reg_0x00_value_div.appendChild(reg_0x00_value_label);
    reg_0x00_value_label.innerHTML = 'Value of 0x00 register: ';
    reg_0x00_value_label.style.fontWeight = 'bold';

    var reg_0x00_value_value = document.createElement('span');
    reg_0x00_value_div.appendChild(reg_0x00_value_value);
    reg_0x00_value_value.innerHTML = `0x${reg_0x00.toString(16).toUpperCase()}`;

    document.getElementById('reg_0x00').appendChild(reg_0x00_value_div);
    
}

function initialize() {
    create_reg_0x00_table('table_register');

    update_reg_0x00();
    createForm('form_container');

    update_formula();
    update_python_code();

}

/*-----------------------------------------------------------------------------
 * EVENT LISTENERS
 ----------------------------------------------------------------------------*/
/*
 * 使用DOMContentLoaded事件确保DOM加载完成后再执行脚本
*/
document.addEventListener('DOMContentLoaded', initialize);
