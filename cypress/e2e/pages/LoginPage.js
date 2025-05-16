import Loaders from "../components/Loaders.js";
import BasePage from "./BasePage.js";

class LoginPage extends BasePage{
    
    // Locators
    get loginInput() { return cy.get('[type="email"]'); }
    get passwordInput() { return cy.get('[type="password"]'); }
    get submitBtn() { return cy.get("#submitButton"); }

    // Methods
    loginWithUI(email, password) {
        cy.fixture('data.json').then((data)=>{
            super.open(data.url);
        })
        this.loginInput.type(email)
        this.passwordInput.type(password)
        this.submitBtn.click();
        Loaders.overlay.should("not.exist");
        
        cy.wait(1000);
        cy.get('body').then($body => {
            if ($body.find('#staticBackdropDocument #staticBackdropLabel + button').length > 0) {
              cy.get('#staticBackdropDocument #staticBackdropLabel + button')
                .should('be.visible')
                .wait(1000).click();
            }
          });
          cy.wait(2000);
    }
}

export default new LoginPage();