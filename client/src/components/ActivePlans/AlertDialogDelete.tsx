import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
  import { Button } from "../ui/button"
  import { Trash2 } from "lucide-react"
  interface prop{
    onChange:()=>void;
    name:string;
  }
export default function AlertDialogDelete({onChange, name}:prop){
    return (
        <AlertDialog>
        <AlertDialogTrigger asChild>
        <Button variant="outline" size='icon-sm' className="hover:bg-red-500 hover:text-black hover:cursor-pointer border-border"><Trash2 /></Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="dark">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              {" "}{name} from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="outline" className="hover:cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onChange} className="hover:bg-red-500 hover:cursor-pointer" variant="destructive">Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
}