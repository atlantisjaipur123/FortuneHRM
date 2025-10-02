import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button variant="ghost" size="sm" type="submit">
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </form>
  )
}
