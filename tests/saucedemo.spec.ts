import { test, expect, Page } from '@playwright/test';

const baseUrl = 'https://www.saucedemo.com/';

async function login(page: Page, username: string, password: string) {
  await page.goto(baseUrl);
  await page.fill('#user-name', username);
  await page.fill('#password', password);
  await page.click('#login-button');
}

test('deve fazer login com credenciais válidas', async ({ page }) => {
  await login(page, 'standard_user', 'secret_sauce');

  await expect(page).toHaveURL(/.*inventory\.html/);
  await expect(page.getByText('Swag Labs')).toBeVisible();
});

test('deve exibir erro com credenciais inválidas', async ({ page }) => {
  await login(page, 'standard_user', 'senha_errada');

  const error = page.locator('[data-test="error"]');
  await expect(error).toBeVisible();
  await expect(error).toContainText('Username and password do not match');
});

test('deve adicionar um produto ao carrinho', async ({ page }) => {
  await login(page, 'standard_user', 'secret_sauce');

  await page.click('#add-to-cart-sauce-labs-backpack');

  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

  await page.click('.shopping_cart_link');
  await expect(page).toHaveURL(/.*cart\.html/);
  await expect(page.locator('.inventory_item_name')).toContainText('Sauce Labs Backpack');
});

test('deve realizar o fluxo completo de checkout', async ({ page }) => {
  await login(page, 'standard_user', 'secret_sauce');

  await page.click('#add-to-cart-sauce-labs-backpack');
  await page.click('.shopping_cart_link');
  await page.click('#checkout');

  await page.fill('[data-test="firstName"]', 'Teste');
  await page.fill('[data-test="lastName"]', 'Automatizado');
  await page.fill('[data-test="postalCode"]', '12345-678');
  await page.click('#continue');

  await expect(page.locator('.summary_total_label')).toBeVisible();

  await page.click('#finish');

  const completeHeader = page.locator('[data-test="complete-header"]');
  await expect(completeHeader).toHaveText(/THANK YOU FOR YOUR ORDER!/i);
});
