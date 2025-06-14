Cypress.on('uncaught:exception', (err, runnable) => {
    if (
        err.message.includes('Script error.') ||
        /google|ads|stat-rock|doubleclick|googlesyndication|adtrafficquality/.test(err.message)
    ) {
        console.warn('Cypress: Ignoring known cross-origin script error:', err.message);
        return false;
    }
    return true;
});

describe('Automation Practice Form Tests', () => {
    const FORM_URL = 'https://demoqa.com/automation-practice-form';
    const THANK_YOU_MODAL_TITLE = 'Thanks for submitting the form';
    const student = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        gender: 'Male',
        mobile: '1234567890',
        dateOfBirth: '15 September,1990',
        subjects: ['Maths', 'Computer Science'],
        hobbies: ['Sports', 'Reading'],
        picture: 'IMG_20250313_135825.jpg',
        currentAddress: '123 Test Street, Test City, Test State, 12345',
        state: 'NCR',
        city: 'Delhi'
    };

    beforeEach(() => {
        cy.visit(FORM_URL);
        cy.get('#app').should('be.visible');
    });

    // --- Positive Scenario ---
    it('1. Positive: Should successfully submit the form with all valid data', () => {
        cy.get('#firstName').type(student.firstName);
        cy.get('#lastName').type(student.lastName);
        cy.get('#userEmail').type(student.email);
        cy.get('.custom-control-label').contains(student.gender).click();
        cy.get('#userNumber').type(student.mobile);
        cy.get('#dateOfBirthInput').click();
        cy.get('.react-datepicker__year-select').select('1990');
        cy.get('.react-datepicker__month-select').select('September');
        cy.get('.react-datepicker__day--015').click({ force: true });
        student.subjects.forEach(subject => {
            cy.get('#subjectsInput').type(subject);
            cy.get('.subjects-auto-complete__menu-list').should('be.visible').contains(subject).click();
        });
        student.hobbies.forEach(hobby => {
            cy.get('.custom-control-label').contains(hobby).click();
        });
        cy.fixture(student.picture, 'base64').then(fileContent => {
            cy.get('#uploadPicture').attachFile(
                { fileContent, fileName: student.picture, mimeType: 'image/jpg', encoding: 'base64' }
            );
        });
        cy.get('#currentAddress').type(student.currentAddress);
        cy.get('#state').click();
        cy.get('#react-select-3-input').type(student.state + '{enter}', { force: true });
        cy.get('#city').click();
        cy.get('#react-select-4-input').type(student.city + '{enter}', { force: true });
        cy.get('#submit').click({ force: true });
        cy.get('.modal-title').should('contain', THANK_YOU_MODAL_TITLE);

        const expectedDataMap: { [key: string]: string } = {
            'Student Name': `${student.firstName} ${student.lastName}`,
            'Student Email': student.email,
            'Gender': student.gender,
            'Mobile': student.mobile,
            'Date of Birth': student.dateOfBirth,
            'Subjects': student.subjects.join(', '),
            'Hobbies': student.hobbies.join(', '),
            'Picture': student.picture,
            'Address': student.currentAddress,
            'State and City': `${student.state} ${student.city}`
        };

        cy.get('tbody tr').each(($row) => {
            const label = $row.find('td').eq(0).text().trim();
            const value = $row.find('td').eq(1).text().trim();

            if (expectedDataMap[label]) {
                expect(value).to.eq(expectedDataMap[label], `Проверка '${label}': '${value}' должно быть '${expectedDataMap[label]}'`);
            } else {
                cy.log(`Предупреждение: Неизвестная метка в модальном окне: ${label}. Пропущена проверка.`);
            }
        });
        cy.get('#closeLargeModal').click();
        cy.get('.modal-content').should('not.exist');
    });

    // --- Negative Scenarios ---

    it('2. Negative: Should show validation error when required fields are empty (First Name)', () => {
        cy.get('#lastName').type(student.lastName);
        cy.get('#userEmail').type(student.email);
        cy.get('.custom-control-label').contains(student.gender).click();
        cy.get('#userNumber').type(student.mobile);
        cy.get('#submit').click({ force: true }); // Force click to ensure it's attempted
        cy.get('.modal-title').should('not.exist');
    });

    it('3. Negative: Should show validation error for invalid email format', () => {
        cy.get('#firstName').type(student.firstName);
        cy.get('#lastName').type(student.lastName);
        cy.get('#userEmail').type('invalid-email');
        cy.get('.custom-control-label').contains(student.gender).click();
        cy.get('#userNumber').type(student.mobile);
        cy.get('#submit').click({ force: true });
        cy.get('.modal-title').should('not.exist');
    });

    it('4. Negative: Should show validation error for mobile number that consists of letters', () => {
        cy.get('#firstName').type(student.firstName);
        cy.get('#lastName').type(student.lastName);
        cy.get('#userEmail').type(student.email);
        cy.get('.custom-control-label').contains(student.gender).click();
        cy.get('#userNumber').type('gfdh').blur();
        cy.get('#submit').click({ force: true });
        cy.wait(500);
        cy.get('.modal-title', { timeout: 10000 }).should('not.exist');
    });

    it('5. Negative: Should show validation error when Gender is not selected', () => {
        cy.get('#firstName').type(student.firstName);
        cy.get('#lastName').type(student.lastName);
        cy.get('#userEmail').type(student.email);
        cy.get('#userNumber').type(student.mobile);
        cy.get('#submit').click({ force: true });
        cy.get('.modal-title').should('not.exist');
    });
});