import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Database, Play, Download, AlertCircle } from "lucide-react";

export default function DatabaseAdmin() {
  const { toast } = useToast();
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResult, setQueryResult] = useState<any>(null);

  const { data: dbInfo, isLoading: dbInfoLoading } = useQuery({
    queryKey: ["/api/admin/database/info"],
  });

  const { data: tables, isLoading: tablesLoading } = useQuery({
    queryKey: ["/api/admin/database/tables"],
  });

  const executeSqlMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/admin/database/execute", { query });
      return response.json();
    },
    onSuccess: (result) => {
      setQueryResult(result);
      toast({
        title: "Query Executed",
        description: "SQL query executed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Query Error",
        description: error.message || "Failed to execute query.",
        variant: "destructive",
      });
    },
  });

  const backupMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/database/backup", {});
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `temple_backup_${new Date().toISOString().split('T')[0]}.sql`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Backup Created",
        description: "Database backup downloaded successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup.",
        variant: "destructive",
      });
    },
  });

  const commonQueries = [
    {
      name: "View All Registrations",
      query: "SELECT * FROM registrations ORDER BY created_at DESC;"
    },
    {
      name: "Registration Stats by Program",
      query: "SELECT program, COUNT(*) as count, SUM(CAST(registration_fee AS NUMERIC)) as total_revenue FROM registrations GROUP BY program;"
    },
    {
      name: "Recent Registrations (Last 7 Days)",
      query: "SELECT * FROM registrations WHERE created_at >= NOW() - INTERVAL '7 days' ORDER BY created_at DESC;"
    },
    {
      name: "Pending Registrations",
      query: "SELECT child_first_name, child_last_name, parent_email, registration_id FROM registrations WHERE status = 'pending';"
    },
    {
      name: "Table Structure",
      query: "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'registrations' ORDER BY ordinal_position;"
    }
  ];

  if (dbInfoLoading || tablesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading database information...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-temple-darkblue flex items-center">
            <Database className="w-8 h-8 mr-3" />
            Database Administration
          </h1>
          <p className="text-gray-600 mt-2">Direct database access and management tools</p>
        </div>
        <Button
          onClick={() => backupMutation.mutate()}
          disabled={backupMutation.isPending}
          className="bg-temple-orange hover:bg-temple-saffron text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          {backupMutation.isPending ? "Creating Backup..." : "Download Backup"}
        </Button>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <span className="font-semibold text-red-800">Production Warning</span>
        </div>
        <p className="text-red-700 mt-1">
          This interface provides direct database access. Use with extreme caution in production environments.
          Always backup your data before making changes.
        </p>
      </div>

      {/* Database Information */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>
              <div className="flex justify-between">
                <span>Database:</span>
                <span className="font-mono">{(dbInfo as any)?.database || "Connected"}</span>
              </div>
              <div className="flex justify-between">
                <span>Tables:</span>
                <span>{(tables as any)?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {commonQueries.slice(0, 3).map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setSqlQuery(query.query)}
                className="w-full justify-start text-left"
              >
                {query.name}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* SQL Query Interface */}
      <Card>
        <CardHeader>
          <CardTitle>SQL Query Console</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">SQL Query</label>
            <Textarea
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              placeholder="Enter your SQL query here..."
              rows={6}
              className="font-mono"
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              {commonQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setSqlQuery(query.query)}
                >
                  {query.name}
                </Button>
              ))}
            </div>
            
            <Button
              onClick={() => executeSqlMutation.mutate(sqlQuery)}
              disabled={!sqlQuery.trim() || executeSqlMutation.isPending}
              className="bg-temple-blue hover:bg-temple-darkblue text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              {executeSqlMutation.isPending ? "Executing..." : "Execute Query"}
            </Button>
          </div>

          {queryResult && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Query Result:</h3>
              <div className="bg-gray-50 p-4 rounded-lg overflow-auto">
                <pre className="text-sm">
                  {JSON.stringify(queryResult, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}