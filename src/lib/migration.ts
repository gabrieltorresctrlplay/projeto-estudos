/**
 * Data Migration Script: Companies → Multi-Tenant Organizations
 *
 * This script migrates the legacy single-tenant Company model to the new
 * multi-tenant architecture with Organizations and OrganizationMembers.
 *
 * IMPORTANT: Run this ONCE in a maintenance window. Backup your database first!
 *
 * What it does:
 * 1. For each document in `companies` collection:
 *    - Create a new `organizations` document (same ID, remove ownerId)
 *    - Create an `organization_members` document (userId = ownerId, role = 'owner')
 *    - Delete the old `companies` document
 *
 * 2. Update `users` collection:
 *    - Rename `selectedCompanyId` → `lastSelectedOrgId`
 */

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore'

import { db } from './firebase'

interface LegacyCompany {
  id: string
  name: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export async function migrateCompaniesToOrganizations() {
  console.log('🚀 Starting migration: companies → organizations + organization_members')

  try {
    // Step 1: Get all companies
    const companiesSnapshot = await getDocs(collection(db, 'companies'))
    const totalCompanies = companiesSnapshot.size
    console.log(`📊 Found ${totalCompanies} companies to migrate`)

    if (totalCompanies === 0) {
      console.log('✅ No companies to migrate. Exiting.')
      return { success: true, migrated: 0 }
    }

    let migratedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Step 2: Migrate each company
    for (const companyDoc of companiesSnapshot.docs) {
      const companyId = companyDoc.id
      const data = companyDoc.data()

      try {
        const company: LegacyCompany = {
          id: companyId,
          name: data.name as string,
          ownerId: data.ownerId as string,
          createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
        }

        console.log(`  🔄 Migrating: ${company.name} (ID: ${companyId})`)

        // 2a. Create organization (same ID, no ownerId)
        await setDoc(doc(db, 'organizations', companyId), {
          name: company.name,
          createdAt: company.createdAt,
          updatedAt: company.updatedAt,
        })

        // 2b. Create owner membership
        await setDoc(doc(db, 'organization_members', `${company.ownerId}_${companyId}`), {
          organizationId: companyId,
          userId: company.ownerId,
          role: 'owner',
          joinedAt: company.createdAt, // Use company creation date as join date
        })

        // 2c. Delete old company document
        await deleteDoc(doc(db, 'companies', companyId))

        console.log(`  ✅ Migrated: ${company.name}`)
        migratedCount++
      } catch (error) {
        console.error(`  ❌ Error migrating company ${companyId}:`, error)
        errors.push(`${companyId}: ${(error as Error).message}`)
        errorCount++
      }
    }

    // Step 3: Update user preferences (selectedCompanyId → lastSelectedOrgId)
    console.log('\n📝 Updating user preferences...')
    const usersSnapshot = await getDocs(collection(db, 'users'))
    let usersUpdated = 0

    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data()

        if (userData.selectedCompanyId) {
          await updateDoc(doc(db, 'users', userDoc.id), {
            lastSelectedOrgId: userData.selectedCompanyId,
            selectedCompanyId: null, // Clear old field
          })
          usersUpdated++
        }
      } catch (error) {
        console.error(`  ⚠️ Error updating user ${userDoc.id}:`, error)
      }
    }

    console.log(`  ✅ Updated ${usersUpdated} user preferences`)

    // Summary
    console.log('\n' + '='.repeat(60))
    console.log('🎉 Migration Complete!')
    console.log('='.repeat(60))
    console.log(`✅ Successfully migrated: ${migratedCount} companies`)
    console.log(`❌ Errors: ${errorCount}`)
    if (usersUpdated > 0) {
      console.log(`📝 User preferences updated: ${usersUpdated}`)
    }

    if (errors.length > 0) {
      console.log('\n⚠️ Errors encountered:')
      errors.forEach((err) => console.log(`  - ${err}`))
    }

    return {
      success: errorCount === 0,
      migrated: migratedCount,
      errors: errorCount,
      userPreferencesUpdated: usersUpdated,
    }
  } catch (error) {
    console.error('💥 Fatal error during migration:', error)
    throw error
  }
}

/**
 * Rollback function (if something goes wrong)
 * WARNING: This assumes you have a backup!
 */
export async function rollbackMigration() {
  console.log('⚠️ ROLLBACK not implemented. Restore from backup if needed.')
  console.log('This is why you should backup your database before running migrations!')
}

// Uncomment to run migration (DO NOT commit this uncommented!)
// migrateCompaniesToOrganizations()
//   .then((result) => {
//     console.log('Migration result:', result)
//     process.exit(0)
//   })
//   .catch((error) => {
//     console.error('Migration failed:', error)
//     process.exit(1)
//   })
