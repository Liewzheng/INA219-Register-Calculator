// myscript.js
function changeText(elementId, newText) {
    document.getElementById(elementId).innerHTML = newText;
}

// 使用DOMContentLoaded事件确保DOM加载完成后再执行脚本
document.addEventListener('DOMContentLoaded', function() {
    // 示例调用该函数，假设HTML中有一个id为'myDiv'的元素
    changeText('myDiv', '这段文字是由JavaScript修改的！');
});