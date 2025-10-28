'use client'

import {
    authClient,
    listSessions,
    revokeSession,
    signOut,
    updateUser,
    useSession,
} from '@/lib/auth-client'
import { GetInitial } from '@/lib/get-initials'
import {
    Dialog,
    DialogPanel,
    Popover,
    PopoverButton,
    PopoverGroup,
    PopoverPanel,
    Transition,
} from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { zodResolver } from '@hookform/resolvers/zod'
import { Key, LogOut, Pencil, Shield } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Fragment, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(2, 'Username must be at least 2 characters'),
  image: z.string().url('Invalid image URL').or(z.literal('')),
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export default function Header() {
  const { data: session, refetch } = useSession()
  const status =
    session === undefined
      ? 'loading'
      : session?.user
      ? 'authenticated'
      : 'unauthenticated'

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams?.get('redirectTo') || '/profile'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isSessionsOpen, setIsSessionsOpen] = useState(false)
  const [activeSessions, setActiveSessions] = useState<any[]>([])
  const [isFetchingSessions, setIsFetchingSessions] = useState(false)
  const [revokingStates, setRevokingStates] = useState<Record<string, boolean>>({})
  const [revokedStates, setRevokedStates] = useState<Record<string, boolean>>({})

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      username: '',
      image: '',
    },
  })

  useEffect(() => {
    if (session?.user) {
      form.reset({
        name: session.user.name || '',
        username: session.user.username || '',
        image: session.user.image || '',
      })
    }
  }, [session, form])

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    setIsUpdatingProfile(true)
    try {
      toast.promise(
        updateUser({
          image: values.image,
          name: values.name,
          username: values.username,
          fetchOptions: {
            onSuccess: () => {
              refetch()
              setIsEditProfileOpen(false)
            },
            onError: (ctx) => {
              throw new Error(ctx.error?.message || 'Failed to update profile')
            },
          },
        }),
        {
          loading: 'Saving profile...',
          success: 'Profile updated!',
          error: (err) => err.message || 'Failed to update profile.',
        },
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // --- THIS FUNCTION IS FIXED ---
  const openSessionsModal = async () => {
    setIsSessionsOpen(true)
    setIsFetchingSessions(true)
    setActiveSessions([]) // Clear previous state

    try {
      // The response is an object: { data: [...] } or { error: { ... } }
      const response = await listSessions()

      // Check for the error property first
      if (response.error) {
        toast.error(response.error.message || 'Failed to fetch sessions')
        setActiveSessions([]) // Ensure state is an empty array
      }
      // Check if the data property exists and is an array
      else if (response.data && Array.isArray(response.data)) {
        setActiveSessions(response.data)
      }
      // Safety net for unexpected responses
      else {
        console.warn('listSessions returned an unexpected response:', response)
        toast.error('Received an invalid response for sessions.')
        setActiveSessions([])
      }
    } catch (error: any) {
      // This catches network failures or other JS errors
      toast.error(error.message || 'An unknown error occurred while fetching sessions')
      setActiveSessions([]) // Also set to empty array on error
    } finally {
      setIsFetchingSessions(false)
    }
  }
  // --- END OF FIX ---

  const handleRevokeSession = async (token: string) => {
    setRevokingStates((prev) => ({ ...prev, [token]: true }))
    try {
      await revokeSession({
        token,
        fetchOptions: {
          onSuccess: () => {
            setRevokedStates((prev) => ({ ...prev, [token]: true }))
            toast.success('Session revoked!')
            openSessionsModal() // Refresh the list
          },
          onError: (ctx) => {
            toast.error(ctx.error?.message || 'Failed to revoke session')
          },
        },
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke session')
    } finally {
      setRevokingStates((prev) => ({ ...prev, [token]: false }))
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully!')
      window.location.href = `/login?redirectTo=${encodeURIComponent(
        redirectTo,
      )}`
    } catch (error: any) {
      toast.error(error.message || 'Logout failed')
    }
  }

  const handleAddPasskey = async () => {
    const toastId = toast.loading('Waiting for passkey prompt...')
    try {
      await authClient.passkey.addPasskey({
        fetchOptions: {
          onSuccess() {
            toast.success(`Passkey added successfully!`, {
              id: toastId
            });
           },
           onError(context) {
             toast.error('Something went wrong', { description: context.error?.message, id: toastId});
           }
         }
       })
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        toast.dismiss(toastId)
      } else {
        toast.error(error.message || 'Failed to add passkey.', { id: toastId })
      }
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-100 backdrop-blur-lg bg-white/10">
      <div className="container mx-auto flex h-12 items-center justify-between px-3">
        <div className='flex gap-4 items-center'>
        <img
          src="https://cdn.kapil.app/images/website/logos/k.png"
          alt="Logo"
          className="h-8 w-auto cursor-pointer"
          onClick={() => router.push('/')}
        />
        <span className='animate-fade-left'>auth.kapil.app</span>
        </div>
        {/* --- DESKTOP MENU --- */}
        <div className="hidden lg:flex items-center gap-x-8">
          {status === 'loading' && (
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          )}

          {status === 'authenticated' && session?.user && (
            <PopoverGroup>
              <Popover className="relative">
                {({ open }) => (
                  <>
                    <PopoverButton className="flex items-center gap-x-1 outline-none">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={session.user.image!}
                          alt={session.user.name!}
                        />
                        <AvatarFallback>
                          {GetInitial(session.user.name!)}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDownIcon
                        className={`h-4 w-4 transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </PopoverButton>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="opacity-0 translate-y-1"
                      enterTo="opacity-100 translate-y-0"
                      leave="transition ease-in duration-150"
                      leaveFrom="opacity-100 translate-y-0"
                      leaveTo="opacity-0 translate-y-1"
                    >
                      <PopoverPanel className="absolute right-0 z-20 mt-3 w-64 rounded-lg bg-white p-4 shadow-lg ring-1 ring-gray-200">
                        <div className="flex items-center space-x-3 border-b pb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={session.user.image!}
                              alt={session.user.name!}
                            />
                            <AvatarFallback>
                              {GetInitial(session.user.name!)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="">{session.user.name}</h4>
                            <p className="text-sm text-gray-500">
                              @{session.user.username}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-col space-y-1">
                          <button
                            onClick={() => {
                              setIsEditProfileOpen(true)
                            }}
                            className="rounded-md px-3 py-2 text-sm hover:bg-gray-50 text-left flex items-center gap-2"
                          >
                            <Pencil size={14} /> Edit Profile
                          </button>
                          <button
                            onClick={() => {
                              openSessionsModal()
                            }}
                            className="rounded-md px-3 py-2 text-sm hover:bg-gray-50 text-left flex items-center gap-2"
                          >
                            <Shield size={14} /> Active Sessions
                          </button>
                          <button
                            onClick={handleAddPasskey}
                            className="rounded-md px-3 py-2 text-sm hover:bg-gray-50 text-left flex items-center gap-2"
                          >
                            <Key size={14} /> Add Passkey
                          </button>
                          <button
                            onClick={handleSignOut}
                            className="rounded-md px-3 py-2 text-sm hover:bg-gray-50 text-left text-red-600 flex items-center gap-2"
                          >
                            <LogOut size={14} /> Log out
                          </button>
                        </div>
                      </PopoverPanel>
                    </Transition>
                  </>
                )}
              </Popover>
            </PopoverGroup>
          )}

          {status === 'unauthenticated' && (
            <div className='flex gap-8'>
            <a
              href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
              className="text-base"
            >
              Log in
            </a>
            <a
              href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
              className="text-base"
            >
              Sign up
            </a>
            </div>
          )}
        </div>
        {/* --- END DESKTOP MENU --- */}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="lg:hidden inline-flex items-center justify-center p-2 text-gray-700"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* --- MOBILE DRAWER --- */}
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        as="div"
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-40" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-3/4 px-5 bg-[var(--color-background)] py-2 transition-all ease-in-out duration-200">
          <div className="flex justify-between items-center mb-4">
            <span className='h-8'></span>
            <button onClick={() => setMobileMenuOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          {status === 'loading' && (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
            </div>
          )}

          {status === 'authenticated' && session?.user && (
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3 border-b pb-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={session.user.image!}
                    alt={session.user.name!}
                  />
                  <AvatarFallback>
                    {GetInitial(session.user.name!)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="">{session.user.name}</h4>
                  <p className="text-sm text-gray-500">
                    @{session.user.username}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsEditProfileOpen(true)
                  setMobileMenuOpen(false)
                }}
                className="text-left py-2 flex items-center gap-2"
              >
                <Pencil size={16} /> Edit Profile
              </button>
              <button
                onClick={() => {
                  openSessionsModal()
                  setMobileMenuOpen(false)
                }}
                className="text-left py-2 flex items-center gap-2"
              >
                <Shield size={16} /> Active Sessions
              </button>
              <button
                onClick={() => {
                  handleAddPasskey()
                  setMobileMenuOpen(false)
                }}
                className="text-left py-2 flex items-center gap-2"
              >
                <Key size={16} /> Add Passkey
              </button>
              <button
                onClick={() => {
                  handleSignOut()
                  setMobileMenuOpen(false)
                }}
                className="text-left py-2 text-red-600 flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}

          {status === 'unauthenticated' && (
            <div>
            <a
              href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
              className="text-base block py-2"
            >
              Log in →
            </a>
            <a
              href={`/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
              className="text-base block py-2"
            >
              Sign up →
            </a>
            </div>
          )}
        </DialogPanel>
      </Dialog>
      {/* --- END MOBILE DRAWER --- */}

      {/* Edit Profile Modal */}
      <Dialog open={isEditProfileOpen} onClose={setIsEditProfileOpen}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="text-lg font-bold mb-4">Edit Profile</h2>
            <form
              onSubmit={form.handleSubmit(onProfileSubmit)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  {...form.register('name')}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Username
                </label>
                <input
                  {...form.register('username')}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
                {form.formState.errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Image URL
                </label>
                <input
                  {...form.register('image')}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
                {form.formState.errors.image && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.image.message}
                  </p>
                )}
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 text-sm border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-4 py-2 text-sm bg-black text-white rounded disabled:opacity-50"
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Active Sessions Modal */}
      <Dialog open={isSessionsOpen} onClose={setIsSessionsOpen}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-2xl rounded-lg bg-white p-6">
            <h2 className="text-lg font-bold mb-4">Active Sessions</h2>
            <p className="text-sm text-gray-600 mb-4">
              This is a list of devices that have logged into your account.
              Revoke any sessions that you do not recognize.
            </p>

            {isFetchingSessions ? (
              <div className="text-center py-4">Loading sessions...</div>
            ) :
              // --- RENDER FIX: Also check if it's an array ---
              !Array.isArray(activeSessions) || activeSessions.length === 0 ? (
              <div className="text-center py-4">No active sessions found.</div>
            ) : (
              <div className="space-y-3">
                {activeSessions.map((sessionItem) => (
                  <div
                    key={sessionItem.token}
                    className="flex items-center justify-between p-3 border-gray-200 border rounded"
                  >
                    <div className="flex-1 scroll-auto gap-1">
                      <span className='text-sm'>{sessionItem.userAgent}<br/> <span className='text-gray-500'>
                        IP: {sessionItem.ipAddress} | Last active:{' '}
                        {formatDate(sessionItem.updatedAt)}</span>
                      </span>
                      {sessionItem.token === session?.session?.token && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Current Session
                        </span>
                      )}
                    </div>
                    {sessionItem.token !== session?.session?.token && (
                      <button
                        onClick={() => handleRevokeSession(sessionItem.token)}
                        disabled={
                          revokingStates[sessionItem.token] ||
                          revokedStates[sessionItem.token]
                        }
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded disabled:opacity-50"
                      >
                        {revokingStates[sessionItem.token]
                          ? 'Revoking...'
                          : revokedStates[sessionItem.token]
                          ? 'Revoked'
                          : 'Revoke'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsSessionsOpen(false)}
                className="px-4 py-2 text-sm border rounded"
              >
                Close
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </header>
  )
}
