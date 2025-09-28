const {
    validateUsernameAndPassword,
    sumPrices,
    amountNotNull,
    countElements,
    sortValues,
    validateNameAndSurname,
    validatePostalCode
} = require('../../jest/jestFunctions');

describe('Test saucedemo', () => {

    Cypress.Commands.add('login', (username, password) => {
        cy.get('[data-test="username"]').type(username);
        cy.get('[data-test="password"]').type(password);
        cy.get('[data-test="login-button"]').click();
    });

    Cypress.Commands.add('logout', () => {
        cy.get('#react-burger-menu-btn').click();
        cy.get('.bm-item.menu-item').eq(2).click();
    });

    Cypress.Commands.add('sumCheck', () => {
        cy.get('.inventory_item_price').then(($prices) => {
            const prices = [...$prices].map(el => parseFloat(el.innerText.replace('$', '')));
            const expectedSum = sumPrices(prices);

            cy.get('[data-test="subtotal-label"]').then(($subtotal) => {
                const subtotalValue = parseFloat($subtotal.text().replace('Item total: $', ''));
                expect(subtotalValue).to.eq(expectedSum);
            });
        });
    });

    Cypress.Commands.add('sort', () => {
        const sortOptions = [
            {value: 'az', comparator: (a, b) => a.localeCompare(b), selector: '.inventory_item_name'},
            {value: 'za', comparator: (a, b) => b.localeCompare(a), selector: '.inventory_item_name'},
            {value: 'lohi', comparator: (a, b) => a - b, selector: '.inventory_item_price'},
            {value: 'hilo', comparator: (a, b) => b - a, selector: '.inventory_item_price'},
        ];

        sortOptions.forEach(({value, comparator, selector}) => {
            cy.get(selector).then(($els) => {
                const original = [...$els].map(el =>
                    selector.includes('price')
                        ? parseFloat(el.innerText.replace('$', ''))
                        : el.innerText
                );
                const expected = sortValues(original, comparator);

                cy.get('.product_sort_container').select(value);
                cy.get(selector).then(($sortedEls) => {
                    const afterSort = [...$sortedEls].map(el =>
                        selector.includes('price')
                            ? parseFloat(el.innerText.replace('$', ''))
                            : el.innerText
                    );
                    expect(afterSort).to.deep.eq(expected);
                });
            });
        });
    });

    Cypress.Commands.add('isSame', () => {
        cy.get('.inventory_item_price').then(($prices) => {
            const originalPrices = [...$prices].map(el => parseFloat(el.innerText.replace('$', '')));
            const sortedPrices = sortValues(originalPrices, (a, b) => a - b);

            cy.get('.product_sort_container').select('lohi');

            cy.get('.inventory_item_price').then(($sortedPrices) => {
                const afterSortPrices = [...$sortedPrices].map(el => parseFloat(el.innerText.replace('$', '')));
                expect(afterSortPrices).to.deep.eq(sortedPrices);
            });
        });
    });

    Cypress.Commands.add('checkout', () => {
        let firstName = "ime"
        let lastName = "prezime"
        let postalCode = "1000"
        cy.get('[data-test="shopping-cart-link"]').click();
        cy.get('[data-test="checkout"]').click();
        expect(validateNameAndSurname(firstName)).to.be.true
        expect(validateNameAndSurname(lastName)).to.be.true
        expect(validatePostalCode(postalCode)).to.be.true
        cy.get('[data-test="firstName"]').type(firstName);
        cy.get('[data-test="lastName"]').type(lastName);
        cy.get('[data-test="postalCode"]').type(postalCode);
        cy.get('[data-test="continue"]').click();
    });

    beforeEach(() => {
        cy.visit('https://www.saucedemo.com');
    });

    it('iterate through all users', () => {
        cy.fixture('users').then((users) => {
            users.forEach((user) => {
                cy.visit('https://www.saucedemo.com');
                cy.login(user.username, user.password);

                const usernameIsValid = validateUsernameAndPassword(user.username, user.password);
                expect(usernameIsValid).to.be.true;

                if (usernameIsValid && user.username !== "locked_out_user") {
                    cy.logout();
                } else {
                    cy.get('[data-test="error"]').should('exist');
                }
            });
        });
    });

    it('login with no data', () => {
        cy.get('[data-test="login-button"]').click();
        cy.get('[data-test="error"]').should('exist');
    });

    it('login with invalid data', () => {
        const name = 'random';
        cy.get('[data-test="username"]').type(name);
        cy.get('[data-test="password"]').type(name);

        const valid = validateUsernameAndPassword(name, name);
        expect(valid).to.be.false;

        cy.get('[data-test="login-button"]').click();
        cy.get('[data-test="error"]').should('exist');
    });

    it('add to cart and check count', () => {
        cy.login('standard_user', 'secret_sauce');
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
        cy.get('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').click();

        cy.get('[data-test^="remove-"]').then($items => {
            const itemsCount = $items.length;
            expect(amountNotNull(itemsCount)).to.be.true
            cy.get('[data-test="shopping-cart-link"]').click();
            cy.get('.cart_item').then($cartItems => {
                expect(countElements($cartItems)).to.eq(itemsCount);
            });
        });
    });

    it('remove items and check count', () => {
        cy.login('standard_user', 'secret_sauce');
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        cy.get('[data-test="shopping-cart-link"]').click();
        cy.get('[data-test="remove-sauce-labs-backpack"]').click();
        cy.get('[data-test^="remove-"]').should('not.exist');
    });

    it('add to cart, go to checkout, go back and add more items', () => {
        cy.login('standard_user', 'secret_sauce');
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        cy.get('[data-test="shopping-cart-link"]').click();
        cy.get('[data-test="continue-shopping"]').click();
        cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
        cy.get('[data-test="shopping-cart-link"]').click();
        cy.get('[data-test="checkout"]').click();
        cy.checkout();
    })

    it('add to cart, sort, add again and checkout', () => {
        cy.login('standard_user', 'secret_sauce');
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        cy.get('[data-test="product-sort-container"]').select('lohi');
        cy.get('[data-test="inventory-item"]').first().click();
        cy.get('[data-test="shopping-cart-link"]').click();
        cy.get('[data-test="checkout"]').click();
        cy.checkout();
    })

    it('click about', () => {
        cy.login('standard_user', 'secret_sauce');
        cy.get('#react-burger-menu-btn').click();
        cy.get('.bm-item.menu-item').eq(1)
            .should('have.attr', 'href')
            .and('include', 'saucelabs.com');
    });


    it('click all items and verify navigation', () => {
        cy.login('standard_user', 'secret_sauce');
        cy.get('#react-burger-menu-btn').click();
        cy.get('.bm-item.menu-item').contains('All Items').click();
        cy.url().should('eq', 'https://www.saucedemo.com/inventory.html');
    });


    it('sorting', () => {
        cy.login('standard_user', 'secret_sauce');
        cy.isSame();
    });

    it('order', () => {
        cy.login('standard_user', 'secret_sauce');
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click();
        cy.checkout();

        cy.get('.inventory_item_price').then(($prices) => {
            const prices = [...$prices].map(el => parseFloat(el.innerText.replace('$', '')));
            const sum1 = sumPrices(prices);

            let sum2 = 0;
            prices.forEach(price => sum2 += price);

            expect(sum1).to.eq(sum2);
        });

        cy.get('[data-test="finish"]').click();
        cy.get('[data-test="complete-header"]').should('be.visible');
    });

    it('order with no items', () => {
        cy.login('standard_user', 'secret_sauce');
        cy.checkout();
        cy.get('[data-test="finish"]').click();
        cy.get('[data-test="complete-header"]').should('be.visible');
    });

    it('checkout requires all fields', () => {
        cy.login('standard_user', 'secret_sauce');
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        cy.get('[data-test="shopping-cart-link"]').click();
        cy.get('[data-test="checkout"]').click();
        cy.get('[data-test="continue"]').click();
        cy.get('[data-test="error"]').should('be.visible');
    });

    it('all sorting options work', () => {
        cy.login("standard_user", "secret_sauce");
        cy.sort();
    });
});
