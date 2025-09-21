describe('SauceDemo Tests', () => {

    // Custom login + logout commands inline
    Cypress.Commands.add('login', (username, password) => {
        cy.get('[data-test="username"]').type(username)
        cy.get('[data-test="password"]').type(password)
        cy.get('[data-test="login-button"]').click()
    })

    Cypress.Commands.add('logout', () => {
        cy.get('#react-burger-menu-btn').click()
        cy.get('[data-test="logout-sidebar-link"]').click()
    })

    beforeEach(() => {
        cy.visit('https://www.saucedemo.com')
    })

    it('login with multiple users (fixture-like array)', () => {
        const users = [
            { username: "standard_user", password: "secret_sauce" },
            { username: "locked_out_user", password: "secret_sauce" },
            { username: "problem_user", password: "secret_sauce" }
        ]

        users.forEach((user) => {
            cy.log(`Testing login for ${user.username}`)
            cy.login(user.username, user.password)
            cy.wait(1000)

            if (user.username !== "locked_out_user") {
                cy.logout()
            }
            cy.visit('https://www.saucedemo.com')
        })
    })

    it('login with multiple users (fixture)', () => {
        cy.fixture('users').then((users) => {
            users.forEach((user) => {
                cy.visit('https://www.saucedemo.com')
                cy.log(`Testing login for ${user.username}`)
                cy.login(user.username, user.password)

                if (user.username !== "locked_out_user") {
                    cy.logout()
                }
            })
        })
    })

    it('add to cart and check count', () => {
        cy.login('standard_user', 'secret_sauce')
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
        cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click()
        cy.get('[data-test="add-to-cart-sauce-labs-fleece-jacket"]').click()

        // Check cart badge shows 3
        cy.get('.shopping_cart_badge').should('contain', '3')

        // Navigate to the cart page
        cy.get('[data-test="shopping-cart-link"]').click()

        // Now cart items exist on this page
        cy.get('.cart_item').should('have.length', 3)
    })

    it('order flow with total validation', () => {
        cy.login('standard_user', 'secret_sauce')
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
        cy.get('[data-test="add-to-cart-sauce-labs-bike-light"]').click()
        cy.get('[data-test="shopping-cart-link"]').click()
        cy.get('[data-test="checkout"]').click()

        cy.get('[data-test="firstName"]').type("name")
        cy.get('[data-test="lastName"]').type("surname")
        cy.get('[data-test="postalCode"]').type("1000")
        cy.get('[data-test="continue"]').click()

        let sum = 0
        cy.get('.inventory_item_price').each(($el) => {
            sum += +$el.text().replace('$', '')
        }).then(() => {
            cy.get('[data-test="subtotal-label"]').then(($subtotal) => {
                const total = +$subtotal.text().replace('Item total: $', '')
                expect(sum).to.eq(total)
            })
        })
        cy.get('[data-test="finish"]').click()
        cy.get('[data-test="complete-header"]').should('be.visible')
    })

    it('sorting works correctly', () => {
        cy.login('standard_user', 'secret_sauce')
        cy.get('.product_sort_container').select('lohi')
        cy.get('.inventory_item_price').then(($prices) => {
            const priceValues = [...$prices].map(el => parseFloat(el.innerText.replace('$','')))
            const sorted = [...priceValues].sort((a, b) => a - b)
            expect(priceValues).to.deep.equal(sorted)
        })
    })

    // ---------------------------
    // EXTRA TESTS FOR COMPLEXITY
    // ---------------------------

    it('login fails with wrong credentials', () => {
        cy.get('[data-test="username"]').type("wrong_user")
        cy.get('[data-test="password"]').type("wrong_pass")
        cy.get('[data-test="login-button"]').click()
        cy.get('[data-test="error"]').should('be.visible')
    })

    it('remove items from cart updates count', () => {
        cy.login('standard_user', 'secret_sauce')
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
        cy.get('[data-test="shopping-cart-link"]').click()
        cy.get('[data-test="remove-sauce-labs-backpack"]').click()
        cy.get('.cart_item').should('have.length', 0)
        cy.get('.shopping_cart_badge').should('not.exist')
    })

    it('checkout requires all fields', () => {
        cy.login('standard_user', 'secret_sauce')
        cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
        cy.get('[data-test="shopping-cart-link"]').click()
        cy.get('[data-test="checkout"]').click()
        cy.get('[data-test="continue"]').click()
        cy.get('[data-test="error"]').should('be.visible')
    })

    it('all sorting options work correctly', () => {
        const sortOptions = [
            { value: 'az', comparator: (a, b) => a.localeCompare(b), selector: '.inventory_item_name' },
            { value: 'za', comparator: (a, b) => b.localeCompare(a), selector: '.inventory_item_name' },
            { value: 'lohi', comparator: (a, b) => a - b, selector: '.inventory_item_price' },
            { value: 'hilo', comparator: (a, b) => b - a, selector: '.inventory_item_price' },
        ]

        cy.login('standard_user', 'secret_sauce')

        sortOptions.forEach(({ value, comparator, selector }) => {
            cy.get('.product_sort_container').select(value)
            cy.get(selector).then(($els) => {
                const values = [...$els].map(el =>
                    selector.includes('price')
                        ? parseFloat(el.innerText.replace('$',''))
                        : el.innerText
                )
                const sorted = [...values].sort(comparator)
                expect(values).to.deep.equal(sorted)
            })
        })
    })

})
