describe('Sauce Demo Product Sorting Test', () => {
    const BASE_URL = 'https://www.saucedemo.com/';
    const INVENTORY_URL = 'https://www.saucedemo.com/inventory.html';
    const USERNAME = 'standard_user';
    const PASSWORD = 'secret_sauce';

    beforeEach(() => {
        cy.visit(BASE_URL);
    });

    it('Should successfully log in and sort products by price (High to Low)', () => {
        cy.get('#user-name').should('be.visible').type(USERNAME);
        cy.get('#password').should('be.visible').type(PASSWORD);
        cy.get('#login-button').click();
        cy.url().should('eq', INVENTORY_URL);
        cy.get('.title').should('contain', 'Products');
        cy.get('[data-test="product-sort-container"]').select('hilo');
        cy.get('.inventory_item_price')
            .then(($prices) => {
                const prices = $prices.map((index, el) => {
                    return parseFloat(Cypress.$(el).text().replace('$', ''));
                }).get();
                for (let i = 0; i < prices.length - 1; i++) {
                    expect(prices[i]).to.be.gte(prices[i + 1], `Price at index ${i} (${prices[i]}) should be >= price at index ${i + 1} (${prices[i + 1]})`);
                }
            });
    });

    it('Should not allow login with invalid credentials', () => {
        cy.get('#user-name').should('be.visible').type('wrong_user');
        cy.get('#password').should('be.visible').type('wrong_password');
        cy.get('#login-button').click();
        cy.get('[data-test="error"]').should('be.visible').and('contain', 'Username and password do not match any user in this service');
        cy.url().should('eq', BASE_URL);
    });
});