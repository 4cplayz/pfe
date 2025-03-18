"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2, Pencil, Search } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define user access levels
type AccessLevel = "Étudiant" | "Professeur" | "Responsable";

// Define user model
interface User {
  id: string;
  name: string;
  matricule: string;
  accessLevel: AccessLevel;
}

// Form validation schema
const userFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  matricule: z.string().length(7, "Le matricule doit contenir 7 chiffres").regex(/^\d+$/, "Le matricule doit contenir uniquement des chiffres"),
  accessLevel: z.enum(["Étudiant", "Professeur", "Responsable"], {
    required_error: "Veuillez sélectionner un niveau d'accès",
  }),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function AccessControl() {
  // Mock data - would be replaced with API calls in the future
  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "Jean Tremblay", matricule: "1234567", accessLevel: "Étudiant" },
    { id: "2", name: "Marie Dubois", matricule: "2345678", accessLevel: "Professeur" },
    { id: "3", name: "Pierre Lavoie", matricule: "3456789", accessLevel: "Étudiant" },
    { id: "4", name: "Sophie Martin", matricule: "4567890", accessLevel: "Responsable" },
    { id: "5", name: "Michel Côté", matricule: "5678901", accessLevel: "Étudiant" },
    { id: "6", name: "Julie Gagnon", matricule: "6789012", accessLevel: "Étudiant" },
    { id: "7", name: "David Bouchard", matricule: "7890123", accessLevel: "Professeur" },
    { id: "8", name: "Isabelle Roy", matricule: "8901234", accessLevel: "Étudiant" },
    { id: "9", name: "François Lemieux", matricule: "9012345", accessLevel: "Étudiant" },
    { id: "10", name: "Natalie Simard", matricule: "0123456", accessLevel: "Responsable" },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      matricule: "",
      accessLevel: "Étudiant",
    },
  });
  
  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      matricule: "",
      accessLevel: "Étudiant",
    },
  });

  // Update filtered users when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If search query is empty, show all users
      setFilteredUsers(users);
      return;
    }
    
    const searchTerm = searchQuery.toLowerCase().trim();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.matricule.includes(searchTerm) ||
        user.accessLevel.toLowerCase().includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Handle adding a new user
  const onAddUser = (data: UserFormValues) => {
    const newUser: User = {
      id: Date.now().toString(), // Temporary ID generation
      name: data.name,
      matricule: data.matricule,
      accessLevel: data.accessLevel,
    };
    
    setUsers([...users, newUser]);
    setIsAddDialogOpen(false);
    form.reset();
  };

  // Handle editing a user
  const onEditUser = (data: UserFormValues) => {
    if (!currentUser) return;
    
    const updatedUsers = users.map((user) =>
      user.id === currentUser.id
        ? { ...user, ...data }
        : user
    );
    
    setUsers(updatedUsers);
    setIsEditDialogOpen(false);
    setCurrentUser(null);
  };

  // Handle deleting a user
  const onDeleteUser = (userId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur?")) {
      setUsers(users.filter((user) => user.id !== userId));
    }
  };

  // Open edit dialog and set current user
  const openEditDialog = (user: User) => {
    setCurrentUser(user);
    editForm.reset({
      name: user.name,
      matricule: user.matricule,
      accessLevel: user.accessLevel,
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tableau d'accès</h1>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou matricule..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>

        {/* Table container with fixed height and overflow */}
        <div className="border-t">
          <div className="max-h-112 overflow-y-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="text-center">Nom</TableHead>
                  <TableHead className="text-center">Matricule</TableHead>
                  <TableHead className="text-center">Niveau d'accès</TableHead>
                  <TableHead className="w-[150px] text-center">Modifier</TableHead>
                  <TableHead className="w-[150px] text-center">Supprimer</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="text-center">{user.name}</TableCell>
                      <TableCell className="text-center">{user.matricule}</TableCell>
                      <TableCell className="text-center">{user.accessLevel}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(user)}>
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDeleteUser(user.id)}
                          className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
            <DialogDescription>
              Saisissez les informations du nouvel utilisateur ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de l'utilisateur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="matricule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matricule</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1234567" 
                        maxLength={7} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau d'accès</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un niveau d'accès" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Étudiant">Étudiant</SelectItem>
                        <SelectItem value="Professeur">Professeur</SelectItem>
                        <SelectItem value="Responsable">Responsable</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Ajouter</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditUser)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom complet</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="matricule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matricule</FormLabel>
                    <FormControl>
                      <Input 
                        maxLength={7} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="accessLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Niveau d'accès</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Étudiant">Étudiant</SelectItem>
                        <SelectItem value="Professeur">Professeur</SelectItem>
                        <SelectItem value="Responsable">Responsable</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Enregistrer</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}