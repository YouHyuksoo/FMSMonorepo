import { Tabs, TabsContent, TabsList, TabsTrigger } from "@fms/ui/tabs";
import { DatabaseSettings } from "@/components/system/configuration/database-settings";
import { StorageSettings } from "@/components/system/configuration/storage-settings";

export default function ConfigurationPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="database" className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">데이터베이스</TabsTrigger>
          <TabsTrigger value="storage">파일 저장소</TabsTrigger>
        </TabsList>
        <TabsContent value="database">
          <DatabaseSettings />
        </TabsContent>
        <TabsContent value="storage">
          <StorageSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
