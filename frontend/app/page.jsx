'use client';

import { useState } from 'react';
import Homepage from '../components/Homepage';

export default function Page() {
  const [password, setPassword] = useState('');
  const [utbEmail, setUtbEmail] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  return <Homepage />;
}