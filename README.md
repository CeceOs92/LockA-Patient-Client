# LockA Patient Client

Patient app for creating health passport, viewing records, approving/revoking provider access, and sharing QR codes.

## About LockA Medical Passport

LockA Medical Passport is a decentralized digital health identity and medical records platform
that gives patients direct control over their healthcare data — inspired by the idea of a school
locker: a safe, personal space the owner decides who can open. It addresses fragmented, hard to
move, and hard to verify medical records across clinics, hospitals, labs, pharmacies, and
insurers by giving each patient a single, patient-controlled health passport.

Medical data itself is never stored on-chain. The Stellar network (via Soroban smart contracts)
is used purely as a trust, permission, audit, and verification layer — identities, consent
states, record hashes/commitments, and audit events. Sensitive records stay encrypted in
off-chain storage and are only decrypted for access the patient has explicitly approved.

Full system documentation: [LockA-Documentation](https://github.com/LockA-Medical-Passport/LockA-Documentation/blob/main/Documentation.md)

## This repository

`locka-patient-client` is the **patient-facing frontend** — one of four repositories in the
LockA GitHub organization:

| Repository | Scope |
| --- | --- |
| **locka-patient-client** (this repo) | Patient onboarding, medical passport, QR sharing, consent approval, record viewing, access history. |
| locka-provider-client | Hospital/clinic/lab/pharmacy/insurer dashboard — access requests, approved record viewing, treatment note uploads. |
| locka-api | Backend services: auth, encrypted storage integration, indexing, notifications, AI workflows. |
| locka-contracts | Stellar/Soroban smart contracts, contract tests, deployment scripts, generated client bindings. |

### Chain and wallet

This repository targets the **Stellar network with Soroban smart contracts**, using the
**Freighter** wallet (XLM-compatible) for browser-based transaction signing in the MVP, with
passkey/smart-wallet onboarding considered for later.

### Design reference

The UI follows the visual design system of a parallel LockA implementation built on EVM/Solidity —
[locka.remixdapp.eth.limo](https://locka.remixdapp.eth.limo/)
([source](https://github.com/Dannyswiss1/LockA-Medical-Passport-Monorepo)). That version targets a
different chain; **only its design system (colors, typography, component style) carries over
here** — this repo's actual blockchain integration is Soroban + Freighter, per the documentation
above.

## Architecture

The patient client creates/manages the passport and drives consent decisions. It talks to the
backend/API for encrypted record storage, indexing, and notifications, and signs Stellar
transactions (via Freighter) for on-chain actions such as passport creation and consent
grant/revoke, which are recorded by Soroban contracts and indexed back through the backend.

```text
Patient Client (this repo)
  | create passport / approve / revoke consent (signed via Freighter)
  v
Backend / API  <-------------------------------  Provider Client
  | encrypted upload/download, indexing, notifications
  v
Encrypted Health Vault                    Stellar / Soroban Contracts
  | records encrypted per patient           | patient identity registry
  | AI summaries from consented data        | consent & access control
                                             | record commitments
                                             | audit events
```

## Smart contracts

The patient client primarily interacts with (directly or via the backend/indexer):

| Contract | Responsibility |
| --- | --- |
| `PatientIdentityRegistry` | Registers the patient's passport identifier, public key, and recovery config. |
| `ConsentAccessControl` | Creates, approves, limits, expires, and revokes provider access permissions. |
| `RecordCommitmentRegistry` | Hashes/commitments of encrypted records, so the client can verify record integrity. |
| `AuditEventEmitter` | Access requests, consent grants/revocations, record updates — powers the patient's audit log. |

(`ProviderRegistry` and `DeviceAttestationRegistry` are read-only concerns here — e.g. showing a
requesting provider's verified status.)

## Key patient flows

1. **Create a medical passport** — connect/create a Stellar wallet, complete profile + emergency
   data, mint a passport identifier and identity commitment.
2. **Review a provider access request** — see the requesting provider, requested record category,
   and duration; approve, limit, or reject.
3. **Revoke access** — end a provider's access immediately, or let a time-limited grant expire.
4. **View records and audit history** — browse consented/owned records and see who requested,
   viewed, or updated them and when.
5. **Share via QR code** — generate a QR code a provider scans to initiate an access request.

## MVP scope (patient client slice)

- Patient registration and medical passport creation
- QR code generation for access-request initiation
- Consent approval, limitation, expiry, and revocation UI
- Encrypted health record upload/viewing
- Patient-visible audit log
- Basic AI-generated patient summary display (from approved records)
- Support for one or two ZK proof flows (e.g. vaccination proof) as they become available from
  `locka-contracts`