import { Response } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../types';

export const getPayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { role, branchId: userBranchId } = req.user!;
    const queryBranchId = req.query.branchId as string | undefined;
    const format = (req.query.format as string) === 'csv' ? 'csv' : 'json';

    let where: Record<string, unknown> = {
      role: { not: 'CUSTOMER' },
    };

    if (role === 'BRANCH_MANAGER') {
      where = { branchId: userBranchId!, role: { not: 'CUSTOMER' } };
    } else if (queryBranchId) {
      where = { branchId: queryBranchId, role: { not: 'CUSTOMER' } };
    }

    const employees = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        employeeId: true,
        salary: true,
        shift: true,
        employeeStatus: true,
        dateJoined: true,
        teamAssignment: true,
        branchId: true,
        branch: { select: { id: true, name: true } },
      } as any,
      orderBy: [{ branchId: 'asc' }, { role: 'asc' }, { lastName: 'asc' }],
    });

    const totalSalaryBill = employees.reduce(
      (sum: number, e: any) => sum + (e.salary ? Number(e.salary) : 0),
      0
    );

    const byBranch = employees.reduce((acc: Record<string, any>, e: any) => {
      const bn = e.branch?.name ?? 'HQ';
      if (!acc[bn]) acc[bn] = { count: 0, totalSalary: 0, employees: [] };
      acc[bn].count++;
      acc[bn].totalSalary += e.salary ? Number(e.salary) : 0;
      acc[bn].employees.push(e);
      return acc;
    }, {});

    if (format === 'csv') {
      const rows: string[][] = [
        ['Employee ID', 'First Name', 'Last Name', 'Email', 'Role', 'Branch', 'Salary (£)', 'Shift', 'Status', 'Date Joined'],
        ...employees.map((e: any) => [
          e.employeeId ?? '',
          e.firstName,
          e.lastName,
          e.email,
          e.role,
          e.branch?.name ?? 'HQ',
          e.salary ? Number(e.salary).toFixed(2) : '0.00',
          e.shift ?? '',
          e.employeeStatus ?? '',
          e.dateJoined ? new Date(e.dateJoined).toLocaleDateString('en-GB') : '',
        ]),
        [],
        ['Total Salary Bill', totalSalaryBill.toFixed(2)],
      ];

      const csv = rows
        .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="payroll-report.csv"');
      res.send(csv);
      return;
    }

    res.json({
      success: true,
      payroll: {
        totalEmployees: employees.length,
        totalSalaryBill,
        byBranch,
        employees,
      },
    });
  } catch (error) {
    console.error('[PAYROLL] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};

export const updateEmployeePayroll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { salary, shift, employeeStatus } = req.body as {
      salary?: number;
      shift?: string;
      employeeStatus?: string;
    };

    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) {
      res.status(404).json({ message: 'Employee not found' });
      return;
    }

    if (target.role === 'CUSTOMER') {
      res.status(400).json({ message: 'Cannot update payroll for a customer account' });
      return;
    }

    const updateData: Record<string, unknown> = {};
    if (salary !== undefined) updateData.salary = salary;
    if (shift) updateData.shift = shift;
    if (employeeStatus) updateData.employeeStatus = employeeStatus;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData as any,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        employeeId: true,
        salary: true,
        shift: true,
        employeeStatus: true,
        branch: { select: { id: true, name: true } },
      } as any,
    });

    res.json({ success: true, employee: updated });
  } catch (error) {
    console.error('[PAYROLL] ERROR:', (error as any)?.message, error);
    res.status(500).json({ message: (error as any)?.message ?? 'Server error' });
  }
};
