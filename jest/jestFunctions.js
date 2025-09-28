function validateUsernameAndPassword(username, password) {
    const users = {
        standard_user:"secret_sauce",
        locked_out_user:"secret_sauce",
        problem_user: "secret_sauce",
        performance_glitch_user:  "secret_sauce",
        error_user:  "secret_sauce",
        visual_user:  "secret_sauce"
    }
    return users[username] === password;
}

function sumPrices(prices) {
    return prices.reduce((a, b) => a + b, 0)
}

function amountNotNull(n) {
    return n >= 1
}

function countElements(elements) {
    return elements.length;
}

function sortValues(values, comparator) {
    return [...values].sort(comparator);
}

function validateNameAndSurname(name) {
    return /^[A-Za-z]+$/.test(name);
}

function validatePostalCode(code) {
    return /^\d+$/.test(code);
}

module.exports = { validateUsernameAndPassword,
    sumPrices,
    amountNotNull,
    countElements,
    sortValues,
    validateNameAndSurname,
    validatePostalCode };
