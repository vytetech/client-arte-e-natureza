import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router";
import { useLang } from "@/lib/i18n";

export default function NotFound() {
  const { t } = useLang();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm text-center">
        <CardHeader>
          <CardTitle className="text-4xl font-bold">404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{t("nf.title")}</p>
          <Button asChild className="w-full">
            <Link to="/">{t("nf.back")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
