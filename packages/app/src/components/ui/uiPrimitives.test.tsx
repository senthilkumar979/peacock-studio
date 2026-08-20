import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';
import { FieldInput } from './FieldInput';
import { FieldSelect } from './FieldSelect';
import { FieldTextarea } from './FieldTextarea';
import { FormField } from './FormField';
import { ModalFooterActions } from './ModalFooterActions';
import { ActionTooltip } from './ActionTooltip';

describe('ui primitives', () => {
  it('Button renders children and forwards clicks', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button variant="secondary" onClick={onClick}>
        Save
      </Button>,
    );
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('FieldInput and FieldTextarea accept values', async () => {
    const user = userEvent.setup();
    render(
      <>
        <FieldInput aria-label="Name" defaultValue="" />
        <FieldTextarea aria-label="Notes" defaultValue="" />
      </>,
    );
    await user.type(screen.getByLabelText('Name'), 'Ada');
    await user.type(screen.getByLabelText('Notes'), 'Hello');
    expect(screen.getByLabelText('Name')).toHaveValue('Ada');
    expect(screen.getByLabelText('Notes')).toHaveValue('Hello');
  });

  it('FieldSelect renders options', async () => {
    const user = userEvent.setup();
    render(
      <FieldSelect aria-label="Role" defaultValue="member">
        <option value="member">Member</option>
        <option value="admin">Admin</option>
      </FieldSelect>,
    );
    await user.selectOptions(screen.getByLabelText('Role'), 'admin');
    expect(screen.getByLabelText('Role')).toHaveValue('admin');
  });

  it('FormField wires label, hint, and error to the control', () => {
    render(
      <FormField label="Email" hint="Work email" error="Required" htmlFor="email-field">
        <FieldInput />
      </FormField>,
    );
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Work email')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('ModalFooterActions invokes cancel and confirm', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <ModalFooterActions
        onCancel={onCancel}
        onConfirm={onConfirm}
        confirmLabel="Create"
        cancelLabel="Back"
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Back' }));
    await user.click(screen.getByRole('button', { name: 'Create' }));
    expect(onCancel).toHaveBeenCalledOnce();
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('ActionTooltip exposes tooltip text', () => {
    render(
      <ActionTooltip label="Edit document">
        <button type="button">Edit</button>
      </ActionTooltip>,
    );
    expect(screen.getByRole('tooltip')).toHaveTextContent('Edit document');
  });
});
