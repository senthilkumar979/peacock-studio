import {
  buildCloudAuthContext,
  getCloudAuthContext,
  setCloudAuthContext,
} from '@/cloud/authContext';
import {
  listMyMemberships,
  pickActiveMembership,
  setStoredActiveOrganizationId,
} from '@/cloud/repositories/organizationRepository';

/** Refresh memberships and active org after onboarding / invite / switch. */
export async function refreshCloudMemberships(preferredOrganizationId?: string): Promise<void> {
  const context = getCloudAuthContext();
  if (!context) return;

  const memberships = await listMyMemberships();
  const activeMembership = pickActiveMembership(memberships, preferredOrganizationId);
  if (activeMembership) {
    setStoredActiveOrganizationId(activeMembership.organizationId);
  }

  setCloudAuthContext(
    buildCloudAuthContext({
      clerkUserId: context.clerkUserId,
      userEmail: context.userEmail,
      userDisplayName: context.userDisplayName,
      memberships,
      activeMembership,
      workspaceResolved: true,
      getAccessToken: context.getAccessToken,
    }),
  );
}
