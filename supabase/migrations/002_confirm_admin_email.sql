-- Confirmar email do usuário admin
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    updated_at = NOW()
WHERE email = 'admin@acesso.com';
