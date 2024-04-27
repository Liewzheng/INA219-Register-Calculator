
/*-----------------------------------------------------------------------------
 * GLOBAL VARIABLES
 ----------------------------------------------------------------------------*/
reg_0x00 = 0x0000;
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

/*-----------------------------------------------------------------------------
 * FUNCTIONS
 ----------------------------------------------------------------------------*/

function handleInputChange(event) {
    // 打印输入的值
    console.log(`Input changed to: ${event.target.value}`);

    let inputValue = event.target.value;
    if (inputValue === '0' || inputValue === '1') {
        // 先获取包含input的td元素，再获取cellIndex
        let tdElement = event.target.parentElement;
        let bitPosition = tdElement.cellIndex;
        // 根据输入更新reg_0x00
        updateRegister(inputValue, bitPosition);
    } else {
        // 如果输入非法，可以考虑恢复原值或给出提示
        event.target.value = event.target.dataset.prevValue || '';
    }
}

// 更新寄存器值的函数
function updateRegister(bitValue, bitPosition) {
    // 将二进制位插入到reg_0x00的对应位置
    reg_0x00 &= ~(1 << (15 - bitPosition)); // 清除对应位置的旧值
    reg_0x00 |= (bitValue === '1' ? 1 : 0) << (15 - bitPosition); // 设置新值
    // 可以在这里添加更多处理，如显示更新后的reg_0x00值
    console.log(`reg_0x00 updated to: 0x${reg_0x00.toString(16).toUpperCase()}`);

    update_reg_0x00('reg_0x00', `reg_0x00: 0x${reg_0x00.toString(16).toUpperCase()}`);

}
/*
 * 寄存器表格
 */
function create_reg_0x00_table(elementId) {
    var table = document.createElement('table');
    table.style.maxWidth = '100%';
    table.style.width = '100%'; // 修改为小写的 width
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

/*
 * 修改元素的文本内容
 */
function update_reg_0x00(elementId, newText) {
    document.getElementById(elementId).innerHTML = newText;
}

function initialize() {
    create_reg_0x00_table('table_register');
    update_reg_0x00('reg_0x00', `Value of 0x00 register: 0x${reg_0x00.toString(16).toUpperCase()}`);

}

/*-----------------------------------------------------------------------------
 * EVENT LISTENERS
 ----------------------------------------------------------------------------*/
/*
 * 使用DOMContentLoaded事件确保DOM加载完成后再执行脚本
*/
document.addEventListener('DOMContentLoaded', initialize);
