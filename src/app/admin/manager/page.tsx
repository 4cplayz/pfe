"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useJournalSubmissions } from "@/hooks/use-journal-submissions";
import { JournalSubmissionWithDetails, SubmissionStatus, SectionResponse } from "@/types/journal-submission";
import { SectionType } from "@/types/journal";
import {
  Search,
  FileText,
  Calendar,
  User,
  ClipboardList,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Loader2,
  FileCheck,
  Eye,
} from "lucide-react";

export default function SubmissionManager() {
  // State for submissions and filtering
  const [submissions, setSubmissions] = useState<JournalSubmissionWithDetails[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<JournalSubmissionWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [dateFilter, setDateFilter] = useState<string>("ALL");
  const [selectedSubmission, setSelectedSubmission] = useState<JournalSubmissionWithDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Get hooks
  const { getSubmissions, loading } = useJournalSubmissions();
  const { toast } = useToast();


  
  // Statistics state
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    reviewed: 0,
    draft: 0,
    studentsActive: 0
  });

  // Load submissions on mount
  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [submissions, searchQuery, statusFilter, dateFilter]);

  // Calculate statistics when submissions change
  useEffect(() => {
    calculateStats(submissions);
  }, [submissions]);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    try {
      const data = await getSubmissions();
      setSubmissions(data);
      setFilteredSubmissions(data);
      console.log("Fetched submissions:", data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les soumissions de journal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: JournalSubmissionWithDetails[]) => {
    if (!data.length) return;

    const studentIds = new Set(data.map(s => s.user.id));
    const submitted = data.filter(s => s.status === "SUBMITTED").length;
    const reviewed = data.filter(s => s.status === "REVIEWED").length;
    const draft = data.filter(s => s.status === "DRAFT").length;

    setStats({
      total: data.length,
      submitted,
      reviewed,
      draft,
      studentsActive: studentIds.size
    });
  };

  const applyFilters = () => {
    let filtered = [...submissions];

    // Apply search query filter
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (submission) =>
          submission.user.name.toLowerCase().includes(lowerCaseQuery) ||
          submission.user.matricule.includes(searchQuery) ||
          submission.journal.title.toLowerCase().includes(lowerCaseQuery)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(
        (submission) => submission.status === statusFilter
      );
    }

    // Apply date filter
    if (dateFilter) {
      const today = new Date();
      const filterDate = new Date(today);

      switch (dateFilter) {
        case "today":
          // Today
          filtered = filtered.filter(submission =>
            new Date(submission.createdAt).toDateString() === today.toDateString()
          );
          break;
        case "week":
          // Last 7 days
          filterDate.setDate(today.getDate() - 7);
          filtered = filtered.filter(submission =>
            new Date(submission.createdAt) >= filterDate
          );
          break;
        case "month":
          // Last 30 days
          filterDate.setDate(today.getDate() - 30);
          filtered = filtered.filter(submission =>
            new Date(submission.createdAt) >= filterDate
          );
          break;
      }
    }

    setFilteredSubmissions(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
    setDateFilter("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (value: string) => {
    // If "ALL" is selected, treat it as if no filter is applied
    if (value === "ALL") {
      setStatusFilter("");
    } else {
      setStatusFilter(value);
    }
  };

  const handleDateFilterChange = (value: string) => {
    // If "ALL" is selected, treat it as if no filter is applied
    if (value === "ALL") {
      setDateFilter("");
    } else {
      setDateFilter(value);
    }
  };

  const handleViewDetails = (submission: JournalSubmissionWithDetails) => {
    setSelectedSubmission(submission);
    setDetailsOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}m ${remainingSeconds}s`;
  };

  const getStatusBadgeClass = (status: SubmissionStatus) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "REVIEWED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "DRAFT":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: SubmissionStatus) => {
    switch (status) {
      case "SUBMITTED":
        return <Clock className="h-3.5 w-3.5" />;
      case "REVIEWED":
        return <CheckCircle className="h-3.5 w-3.5" />;
      case "DRAFT":
        return <FileText className="h-3.5 w-3.5" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5" />;
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredSubmissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Section type renderer
  const renderSectionResponse = (response: SectionResponse) => {
    switch (response.type) {
      case SectionType.VERIFICATION:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{response.title}</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded-sm ${response.checkboxes?.ouverture ? 'bg-primary' : 'bg-muted border'} flex items-center justify-center`}>
                  {response.checkboxes?.ouverture && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                </div>
                <span className="text-sm">Ouverture alimentée</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`h-4 w-4 rounded-sm ${response.checkboxes?.fermeture ? 'bg-primary' : 'bg-muted border'} flex items-center justify-center`}>
                  {response.checkboxes?.fermeture && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                </div>
                <span className="text-sm">Fermeture alimentation</span>
              </div>
            </div>
          </div>
        );

      case SectionType.MATERIAL:
      case SectionType.NOTES:
      case SectionType.COMMENT:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{response.title}</h4>
            <div className="rounded-md bg-muted/50 p-2 text-sm">
              {response.content || <span className="text-muted-foreground italic">Aucun contenu</span>}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">{response.title}</h4>
            <div className="rounded-md bg-muted/50 p-2 text-sm">
              <span className="text-muted-foreground italic">Type de section non reconnu</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestionnaire de Soumissions</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardContent className="flex flex-row items-center justify-between py-6">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Total des soumissions</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="flex flex-row items-center justify-between py-6">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">En attente de revue</p>
              <p className="text-3xl font-bold">{stats.submitted}</p>
            </div>
            <div className="rounded-full bg-yellow-500/10 p-3">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="flex flex-row items-center justify-between py-6">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Déjà revues</p>
              <p className="text-3xl font-bold">{stats.reviewed}</p>
            </div>
            <div className="rounded-full bg-green-500/10 p-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardContent className="flex flex-row items-center justify-between py-6">
            <div className="flex flex-col">
              <p className="text-sm text-muted-foreground">Étudiants actifs</p>
              <p className="text-3xl font-bold">{stats.studentsActive}</p>
            </div>
            <div className="rounded-full bg-blue-500/10 p-3">
              <User className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">Liste des soumissions</CardTitle>
          <CardDescription>
            Consultez et gérez toutes les soumissions de journaux de bord
          </CardDescription>
        </CardHeader>

        {/* Search and Filters */}
        <CardContent className="p-0">
          <div className="border-b px-6 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, matricule ou titre..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>{statusFilter ? `Statut: ${statusFilter}` : 'Filtrer par statut'}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Tous les statuts</SelectItem>
                      <SelectItem value="SUBMITTED">En attente</SelectItem>
                      <SelectItem value="REVIEWED">Revue</SelectItem>
                      <SelectItem value="DRAFT">Brouillon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Select value={dateFilter} onValueChange={handleDateFilterChange}>
                    <SelectTrigger className="w-[180px]">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{dateFilter ? `Date: ${dateFilter === 'today' ? "Aujourd'hui" : dateFilter === 'week' ? '7 derniers jours' : '30 derniers jours'}` : 'Filtrer par date'}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Toutes les dates</SelectItem>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="week">7 derniers jours</SelectItem>
                      <SelectItem value="month">30 derniers jours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  disabled={!searchQuery && !statusFilter && !dateFilter}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="min-h-[200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Étudiant</TableHead>
                  <TableHead>Type de journal</TableHead>
                  <TableHead>Date de soumission</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <ClipboardList className="mb-2 h-8 w-8" />
                        <p>Aucune soumission trouvée</p>
                        {(searchQuery || statusFilter || dateFilter) && (
                          <Button
                            variant="link"
                            onClick={clearFilters}
                            className="mt-2"
                          >
                            Effacer les filtres
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {submission.user.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            #{submission.user.matricule}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{submission.journal.title}</TableCell>
                      <TableCell>{formatDate(submission.createdAt.toString())}</TableCell>
                      <TableCell>{formatDuration(submission.totalTime)}</TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(submission.status as SubmissionStatus)}`}>
                          {getStatusIcon(submission.status as SubmissionStatus)}
                          <span>
                            {submission.status === "SUBMITTED"
                              ? "En attente"
                              : submission.status === "REVIEWED"
                                ? "Revue"
                                : "Brouillon"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewDetails(submission)}
                        >
                          <span className="sr-only">Voir les détails</span>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredSubmissions.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4">
              <div className="text-sm text-muted-foreground">
                Affichage {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, filteredSubmissions.length)} sur{" "}
                {filteredSubmissions.length} résultats
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => paginate(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8"
                        onClick={() => paginate(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() => paginate(currentPage + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Détails de la soumission</DialogTitle>
            <DialogDescription>
              {selectedSubmission ? `Soumis le ${formatDate(selectedSubmission.createdAt.toString())}` : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">
                  <FileCheck className="mr-2 h-4 w-4" />
                  Détails
                </TabsTrigger>
                <TabsTrigger value="responses">
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Réponses
                </TabsTrigger>
                <TabsTrigger value="feedback">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Commentaires
                </TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Student Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">Information étudiant</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Nom</span>
                          <span className="font-medium">{selectedSubmission.user.name}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Matricule</span>
                          <span>#{selectedSubmission.user.matricule}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Niveau d'accès</span>
                          <span>{selectedSubmission.user.accessLevel}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Journal Info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium">Information journal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Titre</span>
                          <span className="font-medium">{selectedSubmission.journal.title}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Description</span>
                          <span>{selectedSubmission.journal.description || "Aucune description"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Niveau d'accès requis</span>
                          <span>{selectedSubmission.journal.accessLevel}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Détails de soumission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">ID de soumission</span>
                          <span className="font-mono text-xs">{selectedSubmission.id}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Date de début</span>
                          <span>{formatDate(selectedSubmission.startTime.toString())}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Date de fin</span>
                          <span>{formatDate(selectedSubmission.endTime.toString())}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Durée totale</span>
                          <span>{formatDuration(selectedSubmission.totalTime)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Statut</span>
                          <div className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(selectedSubmission.status as SubmissionStatus)}`}>
                            {getStatusIcon(selectedSubmission.status as SubmissionStatus)}
                            <span>
                              {selectedSubmission.status === "SUBMITTED"
                                ? "En attente de revue"
                                : selectedSubmission.status === "REVIEWED"
                                  ? "Revue complétée"
                                  : "Brouillon"}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Nombre de sections</span>
                          <span>{selectedSubmission.responses.length} sections</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Responses Tab */}
              <TabsContent value="responses" className="space-y-4 py-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Réponses au journal</CardTitle>
                    <CardDescription>
                      Toutes les réponses fournies par l'étudiant
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedSubmission.responses.length > 0 ? (
                        selectedSubmission.responses.map((response, index) => (
                          <div key={`${response.sectionId}-${index}`}>
                            {index > 0 && <Separator className="my-4" />}
                            {renderSectionResponse(response)}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          Aucune réponse disponible
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Feedback Tab */}
              <TabsContent value="feedback" className="space-y-4 py-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Commentaires</CardTitle>
                    <CardDescription>
                      Rétroaction sur la soumission de l'étudiant
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {selectedSubmission.feedback ? (
                      <div className="bg-muted/50 p-4 rounded-md">
                        <p className="whitespace-pre-wrap">{selectedSubmission.feedback}</p>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        Aucun commentaire n'a été ajouté à cette soumission
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}