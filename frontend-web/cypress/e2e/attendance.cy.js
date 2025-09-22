describe('Attendance System E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173');
    cy.clearLocalStorage();
  });

  it('should complete full attendance flow', () => {
    // Login
    cy.get('input[placeholder="Email"]').type('admin@attendance.com');
    cy.get('input[placeholder="Password"]').type('password123');
    cy.contains('Sign in').click();

    // Wait for dashboard to load
    cy.contains('Welcome', { timeout: 10000 }).should('be.visible');

    // Navigate to attendance page
    cy.contains('Attendance').click();
    cy.contains('Attendance History').should('be.visible');

    // Test QR code generation (mock)
    cy.intercept('POST', '/api/qr/checkin/generate', {
      statusCode: 200,
      body: {
        qr_code: JSON.stringify({
          type: 'user_checkin',
          user_id: 1,
          timestamp: new Date().toISOString(),
          expires_at: new Date(Date.now() + 5 * 60000).toISOString(),
          attendance_type_id: 1
        }),
        expires_at: new Date(Date.now() + 5 * 60000).toISOString()
      }
    });

    cy.contains('Generate QR Code').click();
    cy.contains('QR Code Generated').should('be.visible');

    // Test check-in (mock)
    cy.intercept('POST', '/api/attendance/check-in', {
      statusCode: 201,
      body: {
        message: 'Check-in berhasil',
        attendance: {
          id: 1,
          check_in: new Date().toISOString(),
          is_late: false
        }
      }
    });

    // Simulate QR scan and check-in
    cy.contains('Simulate Check-in').click();
    cy.contains('Check-in berhasil').should('be.visible');

    // Verify attendance appears in history
    cy.contains('Active Check-ins').should('be.visible');
    cy.get('[data-testid="attendance-item"]').should('have.length.at.least', 1);
  });

  it('should handle authentication errors', () => {
    // Test invalid login
    cy.get('input[placeholder="Email"]').type('wrong@example.com');
    cy.get('input[placeholder="Password"]').type('wrongpassword');
    cy.contains('Sign in').click();

    cy.contains('Login Failed').should('be.visible');
  });

  it('should test responsive design', () => {
    // Test mobile view
    cy.viewport('iphone-6');
    
    cy.get('input[placeholder="Email"]').should('be.visible');
    cy.get('input[placeholder="Password"]').should('be.visible');
    
    // Test tablet view
    cy.viewport('ipad-2');
    cy.contains('Attendance QR System').should('be.visible');
  });
});