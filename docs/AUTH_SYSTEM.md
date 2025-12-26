# Helplix Assist Authentication System

## Översikt

Helplix Assist använder Supabase Auth med email/lösenord för autentisering. Systemet stöder anonymitet genom att användare kan registrera sig med dummy-emails (protonmail, yahoo, etc.).

## Arkitektur

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   /auth     │────▶│  Supabase   │────▶│  profiles   │
│   (Login)   │     │    Auth     │     │   (tabell)  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ user_roles  │
                    │  (admin)    │
                    └─────────────┘
```

## Databastabeller

### profiles
Skapas automatiskt via trigger vid signup.

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| id | UUID | PK, FK till auth.users |
| country | TEXT | Jurisdiktion (SE, BR, MX, etc.) |
| created_at | TIMESTAMPTZ | Skapad |

### user_roles
Hanterar admin-behörigheter.

| Kolumn | Typ | Beskrivning |
|--------|-----|-------------|
| id | UUID | PK |
| user_id | UUID | FK till auth.users |
| role | app_role | 'admin' eller 'user' |

## RLS Policies

Alla tabeller använder `auth.uid()` för dataisolering:

- **sessions**: Användare ser bara sina egna sessioner
- **log_entries**: Användare ser bara sina egna loggposter  
- **reports**: Användare ser bara sina egna rapporter
- **profiles**: Användare kan läsa/uppdatera sin profil

## Hooks

### useAuth()
Huvudhook för autentisering.

```typescript
const { 
  user,           // { id, email, country }
  session,        // Supabase Session
  isLoading,      // Boolean
  isAuthenticated,// Boolean
  login,          // (email, password) => Promise
  signUp,         // (email, password, country) => Promise
  logout          // () => Promise
} = useAuth();
```

### useAdminAuth()
Verifierar admin-status via edge function.

```typescript
const { 
  isAdmin,        // Boolean
  isLoading,      // Boolean
  error           // String | null
} = useAdminAuth();
```

## Routes

| Route | Beskrivning | Skyddad |
|-------|-------------|---------|
| /auth | Login/Signup | Nej |
| / | Huvudapp | Ja |
| /admin | Admin-panel | Ja (endast admin) |

## Edge Functions

### verify-admin
Verifierar om en användare har admin-roll.

### manage-role
Lägger till/tar bort admin-roller (endast admins).

## Signup-flöde

1. Användare går till `/auth`
2. Klickar "Registrera dig"
3. Väljer land (jurisdiktion)
4. Anger email + lösenord
5. Konto skapas, trigger skapar profil automatiskt
6. Redirectas till `/`

## Göra användare till admin

Via SQL:
```sql
INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin' FROM auth.users WHERE email = 'user@example.com';
```

Eller via Admin-panelen om du redan är admin.

## Konfiguration

- **Auto-confirm email**: Aktiverat (ingen verifieringsmail)
- **Anonymous signups**: Inaktiverat
