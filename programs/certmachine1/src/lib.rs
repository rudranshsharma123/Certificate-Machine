use anchor_lang::prelude::*;
use {
    anchor_lang::{prelude::*, solana_program::program::invoke, system_program},
    anchor_spl::{associated_token, token},
    mpl_token_metadata::{instruction as token_instruction, ID as TOKEN_METADATA_ID},
};

declare_id!("H4478JdnqaGXKrNDa8WDVMmnVF2zMjoUqcscjWdC7X7h");
const CREATE_MINT_SEED: &[u8] = b"createmints";

#[program]
pub mod certmachine1 {
    use super::*;
    pub fn initialize_storage_account(ctx: Context<InitializeStorageAccount>) -> Result<()> {
        let storage_account = &mut ctx.accounts.storage_account;
        let authority = &mut ctx.accounts.payer;
        storage_account.authority = authority.key();
        storage_account.bump = *ctx.bumps.get("storage_account").unwrap();

        Ok(())
    }

    pub fn mint(
        ctx: Context<MintNft>,
        metadata_title: String,
        metadata_symbol: String,
        metadata_uri: String,
        creator_key: Pubkey,
    ) -> Result<()> {
        let store_account = &mut ctx.accounts.storage_account;
        let collection = mpl_token_metadata::state::Collection {
            verified: false,
            key: creator_key,
        };
        // let to_be_sent = &mut ctx.accounts.to_be_sent_account;

        msg!("Creating mint account...");
        msg!("Mint: {}", &ctx.accounts.mint.key());
        system_program::create_account(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                system_program::CreateAccount {
                    from: ctx.accounts.mint_authority.to_account_info(),
                    to: ctx.accounts.mint.to_account_info(),
                },
            ),
            10000000,
            82,
            &ctx.accounts.token_program.key(),
        )?;
        let creators = vec![
            // mpl_token_metadata::state::Creator {
            //     address: creator_key,
            //     verified: false,
            //     share: 100,
            // },
            mpl_token_metadata::state::Creator {
                address: ctx.accounts.mint_authority.key(),
                verified: false,
                share: 100,
            },
        ];
        msg!("Initializing mint account...");
        msg!("Mint: {}", &ctx.accounts.mint.key());
        token::initialize_mint(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::InitializeMint {
                    mint: ctx.accounts.mint.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
            ),
            0,
            &ctx.accounts.mint_authority.key(),
            Some(&ctx.accounts.mint_authority.key()),
        )?;

        msg!("Creating token account...");
        msg!("Token Address: {}", &ctx.accounts.token_account.key());
        associated_token::create(CpiContext::new(
            ctx.accounts.associated_token_program.to_account_info(),
            associated_token::Create {
                payer: ctx.accounts.mint_authority.to_account_info(),
                associated_token: ctx.accounts.token_account.to_account_info(),
                authority: ctx.accounts.mint_authority.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ))?;

        store_account.authority = ctx.accounts.mint_authority.key();
        store_account.mints += 1;
        // to_be_sent.authority = to_be_sent_account;
        // to_be_sent.mint = ctx.accounts.token_account.key();

        msg!("Minting token to token account...");
        msg!("Mint: {}", &ctx.accounts.mint.to_account_info().key());
        msg!("Token Address: {}", &ctx.accounts.token_account.key());
        token::mint_to(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.token_account.to_account_info(),
                    authority: ctx.accounts.mint_authority.to_account_info(),
                },
            ),
            1,
        )?;

        msg!("Creating metadata account...");
        msg!(
            "Metadata account address: {}",
            &ctx.accounts.metadata.to_account_info().key()
        );
        invoke(
            &token_instruction::create_metadata_accounts_v2(
                TOKEN_METADATA_ID,
                ctx.accounts.metadata.key(),
                ctx.accounts.mint.key(),
                ctx.accounts.mint_authority.key(),
                ctx.accounts.mint_authority.key(),
                ctx.accounts.mint_authority.key(),
                metadata_title,
                metadata_symbol,
                metadata_uri,
                Some(creators),
                1,
                true,
                false,
                Some(collection),
                None,
            ),
            &[
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.token_account.to_account_info(),
                ctx.accounts.mint_authority.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
        )?;

        msg!("Creating master edition metadata account...");
        msg!(
            "Master edition metadata account address: {}",
            &ctx.accounts.master_edition.to_account_info().key()
        );
        invoke(
            &token_instruction::create_master_edition_v3(
                TOKEN_METADATA_ID,
                ctx.accounts.master_edition.key(),
                ctx.accounts.mint.key(),
                ctx.accounts.mint_authority.key(),
                ctx.accounts.mint_authority.key(),
                ctx.accounts.metadata.key(),
                ctx.accounts.mint_authority.key(),
                Some(0),
            ),
            &[
                ctx.accounts.master_edition.to_account_info(),
                ctx.accounts.metadata.to_account_info(),
                ctx.accounts.mint.to_account_info(),
                ctx.accounts.token_account.to_account_info(),
                ctx.accounts.mint_authority.to_account_info(),
                ctx.accounts.rent.to_account_info(),
            ],
        )?;

        msg!("Token mint process completed successfully.");

        Ok(())
    }
    pub fn send(ctx: Context<SendNFT>) -> Result<()> {
        msg!("Creating buyer token account...");
        msg!(
            "Buyer Token Address: {}",
            &ctx.accounts.buyer_token_account.key()
        );
        associated_token::create(CpiContext::new(
            ctx.accounts.associated_token_program.to_account_info(),
            associated_token::Create {
                payer: ctx.accounts.owner_authority.to_account_info(),
                associated_token: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.buyer_authority.to_account_info(),
                mint: ctx.accounts.mint.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
        ))?;

        msg!("Transferring NFT...");
        msg!(
            "Owner Token Address: {}",
            &ctx.accounts.owner_token_account.key()
        );
        msg!(
            "Buyer Token Address: {}",
            &ctx.accounts.buyer_token_account.key()
        );
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                token::Transfer {
                    from: ctx.accounts.owner_token_account.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.owner_authority.to_account_info(),
                },
            ),
            1,
        )?;
        msg!("NFT transferred successfully.");

        msg!("Sale completed successfully!");

        Ok(())
    }
}

#[derive(Accounts)]
// #[instruction(to_be_sent:Pubkey)]
pub struct MintNft<'info> {
    #[account(mut, seeds = [mint_authority.key().as_ref(), CREATE_MINT_SEED], bump = storage_account.bump)]
    pub storage_account: Account<'info, MintedAccountStore>,
    /// CHECK: We're about to create this with Metaplex
    // #[account(init, seeds=[mint_authority.key().as_ref(),TO_BE_SENT_SEED , to_be_sent.key().as_ref()], payer=mint_authority, bump, space = 1000)]
    // pub to_be_sent_account: Account<'info, MintAccountAddress>,
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    /// CHECK: We're about to create this with Metaplex
    #[account(mut)]
    pub master_edition: UncheckedAccount<'info>,

    #[account(mut)]
    pub mint: Signer<'info>,

    /// CHECK: We're about to create this with Anchor
    #[account(mut)]
    pub token_account: UncheckedAccount<'info>,
    #[account(mut)]
    pub mint_authority: Signer<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
    /// CHECK: Metaplex will check this
    pub token_metadata_program: UncheckedAccount<'info>,
}

// mint_account, token_program, mint_auth, rent,

#[derive(Accounts)]
pub struct SendNFT<'info> {
    #[account(mut)]
    pub mint: Account<'info, token::Mint>,
    #[account(mut)]
    pub owner_token_account: Account<'info, token::TokenAccount>,
    #[account(mut)]
    pub owner_authority: Signer<'info>,
    /// CHECK: We're about to create this with Anchor
    #[account(mut)]
    pub buyer_token_account: UncheckedAccount<'info>,
    /// CHECK: We're about to create this with Anchor
    #[account(mut)]
    pub buyer_authority: UncheckedAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
    pub associated_token_program: Program<'info, associated_token::AssociatedToken>,
}

#[derive(Accounts)]

pub struct InitializeStorageAccount<'info> {
    #[account(init, payer=payer, seeds =[payer.key().as_ref(), CREATE_MINT_SEED], bump, space = 1000)]
    pub storage_account: Account<'info, MintedAccountStore>,
    #[account(mut)]
    pub payer: Signer<'info>,
    system_program: Program<'info, System>,
}

#[account]
pub struct MintAccountAddress {
    pub authority: Pubkey,
    pub mint: Pubkey,
}

#[account]
pub struct MintedAccountStore {
    pub authority: Pubkey,
    bump: u8,
    pub mints: u64,
}
