describe('Test saucedemo', () => {
    Cypress.Commands.add('login', (username, password) => {
        cy.get('[data-test="username"]').type(username)
        cy.get('[data-test="password"]').type(password)
        cy.get('[data-test="login-button"]').click()
    })

    Cypress.Commands.add('logout', () => {
        cy.get('#react-burger-menu-btn').click()
        cy.get('.bm-item.menu-item').eq(2).click()
    })

    Cypress.Commands.add('sumCheck', () => {
        let sum = 0
        cy.get('.inventory_item_price').each(($el) => {
            sum += +$el.text().replace('$', '')
        }).then(() => {
            cy.get('[data-test="subtotal-label"]').then(($subtotal) => {
                const total = +$subtotal.text().replace('Item total: $', '')
                expect(sum).to.eq(total)
            })
        })
    })

    Cypress.Commands.add('sort', () => {
        const sortOptions = [
            { value: 'az', comparator: (a, b) => a.localeCompare(b), selector: '.inventory_item_name' },
            { value: 'za', comparator: (a, b) => b.localeCompare(a), selector: '.inventory_item_name' },
            { value: 'lohi', comparator: (a, b) => a - b, selector: '.inventory_item_price' },
            { value: 'hilo', comparator: (a, b) => b - a, selector: '.inventory_item_price' },
        ]
        sortOptions.forEach(({ value, comparator, selector }) => {
            cy.get(selector).then(($els) => {
                const original = [...$els].map(el =>
                    selector.includes('price')
                        ? parseFloat(el.innerText.replace('$', ''))
                        : el.innerText
                )
                const expected = [...original].sort(comparator)
                cy.get('.product_sort_container').select(value)
                cy.get(selector).then(($sortedEls) => {
                    const afterSort = [...$sortedEls].map(el =>
                        selector.includes('price')
                            ? parseFloat(el.innerText.replace('$', ''))
                            : el.innerText
                    )
                    expect(afterSort).to.deep.equal(expected)
                })
            })
        })
    })
    Cypress.Commands.add('isSame', () => {
        cy.get('.inventory_item_price').then(($prices) => {
            const originalPrices = [...$prices].map(el => parseFloat(el.innerText.replace('$','')));
            const sortedPrices = [...originalPrices].sort((a, b) => a - b);
            cy.get('.product_sort_container').select('lohi');
            cy.get('.inventory_item_price').then(($sortedPrices) => {
                const afterSortPrices = [...$sortedPrices].map(el => parseFloat(el.innerText.replace('$','')));
                expect(afterSortPrices).to.deep.equal(sortedPrices);
            });
        });
    })
    Cypress.Commands.add('checkout', () => {
        cy.get('[data-test="shopping-cart-link"]').click()
        cy.get('[data-test="checkout"]').click()

        cy.get('[data-test="firstName"]').type("ime")
        cy.get('[data-test="lastName"]').type("prezime")
        cy.get('[data-test="postalCode"]').type("1000")
        cy.get('[data-test="continue"]').click()
    })

    beforeEach(() => {
        cy.visit('https://www.saucedemo.com')
    })

    it('iterate through all users', () => {
        // const users = [
        //     { username: "standard_user", password: "secret_sauce" },
        //     { username: "locked_out_user", password: "secret_sauce" },
        //     { username: "problem_user", password: "secret_sauce" },
        //     { "username":  "performance_glitch_user", "password":  "secret_sauce"},
        //     { "username":  "error_user", "password":  "secret_sauce"},
        //     { "username":  "visual_user", "password":  "secret_sauce"}
        // ]
        cy.fixture('users').then((users) => {
            users.forEach((user) => {
                cy.visit('https://www.saucedemo.com')
                cy.login(user.username, user.password)

                if (user.username !== "locked_out_user") {
                    cy.logout()
                }
                else {
                    cy.get('[data-test="error"]').should('exist')
                }
            })
        })
    })

    it('login with no data', () => {
        cy.get('[data-test="login-button"]').click()
        cy.get('[data-test="error"]').should('exist')
    })

    it('add to cart and check count', () => {
        cy.login('standard_user', 'secret_sauce')
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
        cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click()
        cy.get('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').click()

        cy.get('.shopping_cart_badge').should('contain', '3')
        cy.get('[data-test="shopping-cart-link"]').click()
        cy.get('.cart_item').should('have.length', 3)
    })

    it('remove items and check count', () => {
        cy.login('standard_user', 'secret_sauce')
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
        cy.get('[data-test="shopping-cart-link"]').click()
        cy.get('[data-test="remove-sauce-labs-backpack"]').click()
        cy.get('.cart_item').should('have.length', 0)
        cy.get('.shopping_cart_badge').should('not.exist')
    })

    it('sorting', () => {
        cy.login('standard_user', 'secret_sauce');
        cy.isSame()
    });

    it('order', () => {
        cy.login('standard_user', 'secret_sauce')
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
        cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click()
        cy.checkout()
        cy.sumCheck()
        cy.get('[data-test="finish"]').click()
        cy.get('[data-test="complete-header"]').should('be.visible')
    })

    it('order with no items', () => {
        cy.login('standard_user', 'secret_sauce')
        cy.checkout()
        cy.get('[data-test="finish"]').click()
        cy.get('[data-test="complete-header"]').should('be.visible')
    })

    it('checkout requires all fields', () => {
        cy.login('standard_user', 'secret_sauce')
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
        cy.get('[data-test="shopping-cart-link"]').click()
        cy.get('[data-test="checkout"]').click()
        cy.get('[data-test="continue"]').click()
        cy.get('[data-test="error"]').should('be.visible')
    })

    it('all sorting options work', () => {
        cy.sort
    })
})
