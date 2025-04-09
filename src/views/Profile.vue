<script setup lang="ts">
import { ref, onMounted, inject } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/card'
import { Github, Edit, Trash2, Check } from 'lucide-vue-next'
import { useToast } from '@/components/ui/toast/use-toast'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { profileService } from '@/api/services/profile.service'

const { toast } = useToast()

// User data from API
const user = ref({
  name: '',
  email: '',
  emailVerified: false,
  authMethods: [] as string[],
  lastConnection: ''
})

const editedName = ref('')
const editedEmail = ref('')
const isEditingName = ref(false)
const isEditingEmail = ref(false)
const isLoading = ref(false)
const setSettingsLoading = inject('setSettingsLoading', null) as ((loading: boolean) => void) | null

// Fetch user profile data when component mounts
onMounted(async () => {
  try {
    isLoading.value = true
    if (setSettingsLoading) setSettingsLoading(true)
    const profileData = await profileService.getProfile()
    
    // Update user data with API response
    user.value = {
      name: profileData.name || (profileData.user_metadata?.name || ''),
      email: profileData.email || '',
      emailVerified: Boolean(profileData.email_confirmed_at),
      authMethods: profileData.identities ? profileData.identities.map(identity => identity.provider) : [] as string[],
      lastConnection: profileData.last_sign_in_at || ''
    }
    
    // Initialize edited values
    editedName.value = user.value.name
    editedEmail.value = user.value.email
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to load profile data',
      variant: 'destructive'
    })
    console.error('Error loading profile:', error)
  } finally {
    isLoading.value = false
    if (setSettingsLoading) setSettingsLoading(false)
  }
})

const deleteAccount = async () => {
  try {
    await profileService.deleteProfile()
    toast({
      title: 'Account deleted',
      description: 'Your account has been successfully deleted'
    })
    // Redirect to home or login page after successful deletion
    window.location.href = '/login'
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to delete account',
      variant: 'destructive'
    })
    console.error('Error deleting account:', error)
  }
}

const saveName = async () => {
  try {
    if (setSettingsLoading) setSettingsLoading(true)
    await profileService.updateProfile({ name: editedName.value })
    user.value.name = editedName.value
    isEditingName.value = false
    toast({
      title: 'Name updated',
      description: 'Your name has been updated successfully'
    })
    if (setSettingsLoading) setSettingsLoading(false)
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update name',
      variant: 'destructive'
    })
    console.error('Error updating name:', error)
  }
}

const saveEmail = async () => {
  try {
    if (setSettingsLoading) setSettingsLoading(true)
    await profileService.updateProfile({ email: editedEmail.value })
    user.value.email = editedEmail.value
    isEditingEmail.value = false
    toast({
      title: 'Email updated',
      description: 'Your email has been updated successfully'
    })
    if (setSettingsLoading) setSettingsLoading(false)
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to update email',
      variant: 'destructive'
    })
    console.error('Error updating email:', error)
  }
}
</script>

<template>
  <div class="px-4 md:px-8 py-2 text-left space-y-6">

      <!-- Name Card -->
      <Card>
        <CardHeader>
          <CardTitle>Your name</CardTitle>
        </CardHeader>
        <CardContent class="flex items-center gap-2">
          <Input
            v-model="editedName"
            :disabled="!isEditingName"
            class="w-full max-w-md"
          />
          <Button
            v-if="!isEditingName"
            variant="ghost"
            size="icon"
            @click="isEditingName = true"
          >
            <Edit class="w-4 h-4" />
          </Button>
          <Button
            v-else
            variant="ghost"
            size="icon"
            @click="saveName"
          >
            <Check class="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

     <!-- Email Card -->
       <Card>
         <CardHeader>
           <CardTitle>Your email</CardTitle>
         </CardHeader>
         <CardContent class="flex items-center gap-2">
           <Input
             v-model="editedEmail"
             :disabled="!isEditingEmail"
             class="w-full max-w-md"
           />
           <Button
             v-if="!isEditingEmail"
             variant="ghost"
             size="icon"
             @click="isEditingEmail = true"
           >
             <Edit class="w-4 h-4" />
           </Button>
           <Button
             v-else
             variant="ghost"
             size="icon"
             @click="saveEmail"
           >
             <Check class="w-4 h-4" />
           </Button>
         </CardContent>
         <CardDescription v-if="!user.emailVerified && !isLoading" class="px-6 pb-4 text-destructive">
           Email not verified
         </CardDescription>
       </Card>

       <!-- Authentication Card
       <Card>
         <CardHeader>
           <CardTitle>Authentication</CardTitle>
         </CardHeader>
         <CardContent class="space-y-4">
           <div class="flex items-center justify-between gap-2 text-sm" v-if="user.authMethods.includes('github')" >
             <span class="flex items-center gap-2"><Github class="w-5 h-5" /> GitHub</span>
             <span class="text-muted-foreground">
               {{ user.lastConnection ? 'Last connected: '+new Date(user.lastConnection).toLocaleDateString() : 'N/A' }}
             </span>
             <Button 
               variant="outline" 
               size="sm"
               @click="async () => {
                 try {
                   // Find the GitHub identity ID
                   const identities = await profileService.getIdentities();
                   const githubIdentity = identities.find(i => i.provider === 'github');
                   if (githubIdentity) {
                     await profileService.unlinkIdentity(githubIdentity.id);
                     // Update auth methods
                     user.value.authMethods = user.value.authMethods.filter(m => m !== 'github');
                     toast({
                       title: 'GitHub unlinked',
                       description: 'Your GitHub account has been unlinked'
                     });
                   }
                 } catch (error) {
                   toast({
                     title: 'Error',
                     description: 'Failed to unlink GitHub account',
                     variant: 'destructive'
                   });
                   console.error('Error unlinking GitHub:', error);
                 }
               }">
               Unlink
             </Button>
           </div>
           <Button
             v-if="!user.authMethods.includes('github')"
             variant="outline"
             class="w-fit"
             @click="async () => {
               try {
                 await profileService.linkIdentity('github');
                 // Update auth methods
                 if (!user.value.authMethods.includes('github')) {
                   user.value.authMethods.push('github');
                 }
                 toast({
                   title: 'GitHub linked',
                   description: 'Your GitHub account has been linked successfully'
                 });
               } catch (error) {
                 toast({
                   title: 'Error',
                   description: 'Failed to link GitHub account',
                   variant: 'destructive'
                 });
                 console.error('Error linking GitHub:', error);
               }
             }"
           >
             Link GitHub account
           </Button>
         </CardContent>
       </Card> -->

       <!-- Password Card -->
       <Card>
         <CardHeader>
           <CardTitle>Password</CardTitle>
           <CardDescription>
             Your password can be reset by clicking the button below. <br> A link will be sent to your email with instructions.
           </CardDescription>
         </CardHeader>
         
         <CardContent>
           <div v-if="user.authMethods.includes('github') && !user.authMethods.includes('password')" class="flex items-center gap-2">
             <Github class="w-5 h-5" />
             <span class="text-sm">Managed by GitHub</span>
           </div>
           <Button
             v-else
             variant="outline"
             class="w-fit"
             @click="async () => {
               try {
                 await profileService.resetPassword(user.email);
                 toast({
                   title: 'Password reset email sent',
                   description: 'Check your email for instructions to reset your password'
                 });
               } catch (error) {
                 toast({
                   title: 'Error',
                   description: 'Failed to send password reset email',
                   variant: 'destructive'
                 });
                 console.error('Error resetting password:', error);
               }
             }"
           >
             Reset password
           </Button>
         </CardContent>
       </Card>

       <!-- Delete Account Card -->
       <Card class="border-destructive">
         <CardHeader>
           <CardTitle class="text-destructive">Delete account</CardTitle>
           <CardDescription>
             This action cannot be undone. 
             <br> 
             This will permanently delete your account and remove your data from our servers.
           </CardDescription>
         </CardHeader>
         <CardFooter class="flex justify-start">
           <AlertDialog>
             <AlertDialogTrigger as-child>
               <Button variant="destructive">
                 <Trash2 class="w-4 h-4 mr-2" />
                 Delete account
               </Button>
             </AlertDialogTrigger>
             <AlertDialogContent>
               <AlertDialogHeader>
                 <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                 <AlertDialogDescription>
                   This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                 </AlertDialogDescription>
               </AlertDialogHeader>
               <AlertDialogFooter>
                 <AlertDialogCancel>Cancel</AlertDialogCancel>
                 <AlertDialogAction @click="deleteAccount">Delete</AlertDialogAction>
               </AlertDialogFooter>
             </AlertDialogContent>
           </AlertDialog>
         </CardFooter>
       </Card>
    
  </div>
</template>
