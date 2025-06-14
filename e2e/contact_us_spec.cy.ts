describe('Test form "Contact Us" in WebdriverUniversity', () => {
    beforeEach(() => {
        cy.visit('https://webdriveruniversity.com/Contact-Us/contactus.html');
    });

    it('Shoult send form seccussfully with valid data', () => {
        cy.get('[name="first_name"]').type('Yulya');
        cy.get('[name="last_name"]').type('Mandryk');
        cy.get('[name="email"]').type('yulya.mandryk@example.com');
        cy.get('textarea[name="message"]').type('This is test message from Cypress.');
        cy.get('[type="submit"]').click();
        cy.get('h1').should('contain', 'Thank You for your Message!');
    });

    it('Should show error with invalid data', () => {
        cy.get('[name="first_name"]').type('Yulya');
        cy.get('[type="submit"]').click();
        cy.get('body').should('contain', 'Error: all fields are required');
    });

});