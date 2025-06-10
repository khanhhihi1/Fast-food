import { SignupFormSchema, FormState } from "@/app/lib/definitions";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { redirect } from "next/navigation";
export async function SignUp(state: FormState, formData: FormData) {
  const validatedFields = SignupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const { name, email, password } = validatedFields.data;
  fetch("http://localhost:9000/User", {
    headers: {
      Accept: "application/json , text/plain , */*",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  })
    .then(function (res) {
      console.log(res);
      if (!res.ok) {
        toast.error("Post added Error");
        redirect("/login");
      }
      toast.success("Post added Successfully");
      window.location.reload();
    })
    .catch(function (res) {
      console.log(res);
      return toast.error("Post added Error");
    });
}
