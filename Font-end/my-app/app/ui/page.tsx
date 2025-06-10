'use client'
import { useRouter } from 'next/navigation';
import { useActionState } from 'react'
import { createUser } from '@/app/action'
import Form from 'react-bootstrap/Form';
const initialState = {
    message: '',
}
export default function Signup() {
    // const router = useRouter();
    // const [state, formAction, pending] = useActionState(createUser, initialState)

    return (
        <Form>
        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
          <Form.Label>Email address</Form.Label>
          <Form.Control type="email" placeholder="name@example.com" />
        </Form.Group>
        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
          <Form.Label>Example textarea</Form.Label>
          <Form.Control as="textarea" rows={3} />
        </Form.Group>
      </Form>
    )
}