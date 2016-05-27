function getMessage(a, b) {
    if (typeof a == 'boolean') {
        if (a) {
            return 'Переданное GIF-изображение анимировано и содержит ' + b + ' кадров';
        } else {
            return 'Переданное GIF-изображение не анимировано';
        }
    }
    else if (typeof a == 'number') {
        return 'Переданное SVG-изображение содержит ' + a + ' объектов и ' + b * 4 + ' атрибутов';
    }
    else if (Array.isArray(a)) {
        if (Array.isArray(b)) {
            return 'Общая площадь артефактов сжатия: ' + getSquare(a, b) + ' пикселей';
        } else {
            return 'Количество красных точек во всех строчках изображения: ' + getSum(a);
        }
    }
}

function getSum(a) {
    var sum = null;
    for (var i = 0; i < a.length; i++) {
        sum += a[i];
    }
    return sum;
}

function getSquare(a, b) {
    var square = null;
    for (var i = 0; i < a.length; i++) {
        square += a[i] * b[i];
    }
    return square;
}